jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/cotizaciones.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');

const fs = require('node:fs');
const request = require('supertest');
const { crearApp } = require('../src/app');
const cotizaciones = require('../src/repositories/cotizaciones.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const pendientes = require('../src/repositories/pendientes.repository');
const { bearer, ADMIN, CLIENTE } = require('./ayudas');

const app = crearApp();

const formulario = {
  telefono: '477 123 4567',
  tipoCliente: 'Constructora',
  tipoTrabajo: 'ventanas',
  direccion: 'Blvd. Campestre 214, Col. Jardines, León, Gto.',
  medidas: '3 ventanas de 1.20 × 1.50 m',
  descripcion: 'Cambio de ventanas en 3 niveles de oficinas.',
};

beforeEach(() => {
  jest.clearAllMocks();
  usuarios.listarAdmins.mockResolvedValue([{ id: 1 }, { id: 5 }]);
  cotizaciones.crear.mockResolvedValue(40);
});

describe('POST /api/cotizaciones', () => {
  test('sin sesión no se puede cotizar (CC-01)', async () => {
    const respuesta = await request(app).post('/api/cotizaciones').send(formulario);
    expect(respuesta.status).toBe(401);
    expect(cotizaciones.crear).not.toHaveBeenCalled();
  });

  test('el personal no envía cotizaciones', async () => {
    const respuesta = await request(app).post('/api/cotizaciones').set('Authorization', bearer(ADMIN)).send(formulario);
    expect(respuesta.status).toBe(403);
  });

  test('marca cada campo obligatorio que falta y no guarda nada (CC-10)', async () => {
    const respuesta = await request(app)
      .post('/api/cotizaciones')
      .set('Authorization', bearer(CLIENTE))
      .send({ medidas: '2 x 3 m' });
    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles).sort()).toEqual(
      ['descripcion', 'direccion', 'telefono', 'tipoCliente', 'tipoTrabajo'].sort(),
    );
    expect(cotizaciones.crear).not.toHaveBeenCalled();
  });

  test('rechaza un tipo de trabajo que no existe', async () => {
    const respuesta = await request(app)
      .post('/api/cotizaciones')
      .set('Authorization', bearer(CLIENTE))
      .send({ ...formulario, tipoTrabajo: 'puertas' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.tipoTrabajo).toMatch(/opción válida/);
  });

  test('guarda la cotización ligada al cliente y avisa a cada administrador', async () => {
    const respuesta = await request(app).post('/api/cotizaciones').set('Authorization', bearer(CLIENTE)).send(formulario);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.cotizacion).toMatchObject({ id: 40, estado: 'recibida', tipoCliente: 'constructora' });
    expect(cotizaciones.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: CLIENTE.id }), 'cx');
    expect(pendientes.crear).toHaveBeenCalledTimes(2);
    expect(pendientes.crear.mock.calls[0][0]).toMatchObject({ usuarioId: 1, tipo: 'cotizacion' });
  });

  test('acepta un plano en PDF junto con el formulario', async () => {
    const peticion = request(app).post('/api/cotizaciones').set('Authorization', bearer(CLIENTE));
    for (const [campo, valor] of Object.entries(formulario)) peticion.field(campo, valor);
    const respuesta = await peticion.attach('archivos', Buffer.from('%PDF-1.4 plano'), {
      filename: 'plano.pdf',
      contentType: 'application/pdf',
    });

    expect(respuesta.status).toBe(201);
    expect(cotizaciones.agregarArchivo).toHaveBeenCalledWith(
      expect.objectContaining({ cotizacionId: 40, nombreOriginal: 'plano.pdf', tipoMime: 'application/pdf' }),
      'cx',
    );
  });

  test('rechaza archivos que no son imagen ni PDF', async () => {
    const peticion = request(app).post('/api/cotizaciones').set('Authorization', bearer(CLIENTE));
    for (const [campo, valor] of Object.entries(formulario)) peticion.field(campo, valor);
    const respuesta = await peticion.attach('archivos', Buffer.from('MZ'), { filename: 'virus.exe', contentType: 'application/x-msdownload' });
    expect(respuesta.status).toBe(400);
    expect(cotizaciones.crear).not.toHaveBeenCalled();
  });

  test('si el formulario está incompleto, borra los archivos que llegaron', async () => {
    const unlink = jest.spyOn(fs.promises, 'unlink');
    const respuesta = await request(app)
      .post('/api/cotizaciones')
      .set('Authorization', bearer(CLIENTE))
      .field('telefono', '4771234567')
      .attach('archivos', Buffer.from('%PDF-1.4'), { filename: 'plano.pdf', contentType: 'application/pdf' });
    expect(respuesta.status).toBe(400);
    expect(unlink).toHaveBeenCalledTimes(1);
    unlink.mockRestore();
  });
});

describe('GET /api/cotizaciones', () => {
  test('el cliente ve solo las suyas y el personal ve todas', async () => {
    cotizaciones.listarDeUsuario.mockResolvedValue([{ id: 40 }]);
    cotizaciones.listarTodas.mockResolvedValue([{ id: 40 }, { id: 41 }]);

    const delCliente = await request(app).get('/api/cotizaciones').set('Authorization', bearer(CLIENTE));
    const delAdmin = await request(app).get('/api/cotizaciones').set('Authorization', bearer(ADMIN));

    expect(delCliente.body.cotizaciones).toHaveLength(1);
    expect(cotizaciones.listarDeUsuario).toHaveBeenCalledWith(CLIENTE.id);
    expect(delAdmin.body.cotizaciones).toHaveLength(2);
  });
});
