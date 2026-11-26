// Lo que pasa con una cotización después de enviarla: el cliente la cambia (RF-11), el personal la avanza,
// los dos ven sus archivos y, al abrir el proyecto, quedan ligados.
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/cotizaciones.repository');
jest.mock('../src/repositories/solicitudes.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/empresas.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/utils/correo');

const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const { crearApp } = require('../src/app');
const cotizaciones = require('../src/repositories/cotizaciones.repository');
const solicitudes = require('../src/repositories/solicitudes.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const pendientes = require('../src/repositories/pendientes.repository');
const proyectos = require('../src/repositories/proyectos.repository');
const empresas = require('../src/repositories/empresas.repository');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();

const COTIZACION = {
  id: 40, clienteId: CLIENTE.id, empresaId: CLIENTE.empresaId, tipoTrabajo: 'ventanas', estado: 'recibida', proyectoId: null,
};
const CAMBIO = {
  telefono: '477 123 4567',
  tipoCliente: 'constructora',
  tipoTrabajo: 'ventanas',
  direccion: 'Blvd. Campestre 214, León, Gto.',
  medidas: '4 ventanas de 1.20 × 1.50 m',
  descripcion: 'Ahora son 4 ventanas en lugar de 3.',
};

beforeEach(() => {
  jest.clearAllMocks();
  cotizaciones.buscarPorId.mockResolvedValue({ ...COTIZACION });
  usuarios.listarAdmins.mockResolvedValue([{ id: 1 }, { id: 5 }]);
  usuarios.listarClientesDeEmpresa.mockResolvedValue([]);
  solicitudes.responsableDeCotizacion.mockResolvedValue(null);
});

describe('GET /api/cotizaciones/:id', () => {
  test('el cliente ve su cotización con la lista de archivos; otro cliente recibe 404', async () => {
    cotizaciones.listarArchivos.mockResolvedValue([{ id: 3, nombre: 'plano.pdf', tipoMime: 'application/pdf' }]);

    const propia = await request(app).get('/api/cotizaciones/40').set('Authorization', bearer(CLIENTE));
    const ajena = await request(app).get('/api/cotizaciones/40').set('Authorization', bearer(OTRO_CLIENTE));

    expect(propia.status).toBe(200);
    expect(propia.body.cotizacion.archivos).toEqual([{ id: 3, nombre: 'plano.pdf', tipoMime: 'application/pdf' }]);
    expect(ajena.status).toBe(404);
  });
});

describe('PUT /api/cotizaciones/:id: el cliente pide cambios (RF-11)', () => {
  test('guarda el cambio y lo deja en la bandeja como modificación', async () => {
    const respuesta = await request(app).put('/api/cotizaciones/40').set('Authorization', bearer(CLIENTE)).send(CAMBIO);

    expect(respuesta.status).toBe(200);
    expect(cotizaciones.modificar).toHaveBeenCalledWith(40, expect.objectContaining({ medidas: '4 ventanas de 1.20 × 1.50 m' }), 'cx');
    expect(solicitudes.crear).toHaveBeenCalledWith(
      expect.objectContaining({ canal: 'portal', categoria: 'modificacion', cotizacionId: 40, clienteId: CLIENTE.id }),
      'cx',
    );
    // Sin responsable todavía: se avisa a todo el personal.
    expect(pendientes.crear).toHaveBeenCalledTimes(2);
  });

  test('si ya se había enviado, vuelve a «En revisión» y avisa solo a su responsable', async () => {
    cotizaciones.buscarPorId.mockResolvedValue({ ...COTIZACION, estado: 'enviada' });
    solicitudes.responsableDeCotizacion.mockResolvedValue(5);

    const respuesta = await request(app).put('/api/cotizaciones/40').set('Authorization', bearer(CLIENTE)).send(CAMBIO);

    expect(respuesta.body.cotizacion.estado).toBe('en_revision');
    expect(cotizaciones.cambiarEstado).toHaveBeenCalledWith(40, 'en_revision', 'cx');
    expect(solicitudes.crear).toHaveBeenCalledWith(expect.objectContaining({ responsableId: 5 }), 'cx');
    expect(pendientes.crear).toHaveBeenCalledTimes(1);
    expect(pendientes.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: 5, tipo: 'solicitud' }), 'cx');
  });

  test('un cambio incompleto se rechaza sin tocar la cotización', async () => {
    const respuesta = await request(app)
      .put('/api/cotizaciones/40')
      .set('Authorization', bearer(CLIENTE))
      .send({ ...CAMBIO, descripcion: '' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.descripcion).toBeDefined();
    expect(cotizaciones.modificar).not.toHaveBeenCalled();
  });

  test('un cliente no puede cambiar la cotización de otro', async () => {
    const respuesta = await request(app).put('/api/cotizaciones/40').set('Authorization', bearer(OTRO_CLIENTE)).send(CAMBIO);
    expect(respuesta.status).toBe(404);
    expect(cotizaciones.modificar).not.toHaveBeenCalled();
  });

  test('con el proyecto ya abierto, los cambios se piden en el chat y no aquí', async () => {
    cotizaciones.buscarPorId.mockResolvedValue({ ...COTIZACION, proyectoId: 12 });
    const respuesta = await request(app).put('/api/cotizaciones/40').set('Authorization', bearer(CLIENTE)).send(CAMBIO);
    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).toMatch(/chat del proyecto/);
    expect(cotizaciones.modificar).not.toHaveBeenCalled();
  });

  test('si el cambio lo captura el personal, no se crea otra solicitud', async () => {
    const respuesta = await request(app).put('/api/cotizaciones/40').set('Authorization', bearer(ADMIN)).send(CAMBIO);
    expect(respuesta.status).toBe(200);
    expect(solicitudes.crear).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/cotizaciones/:id/estado', () => {
  test('solo el personal cambia el estado', async () => {
    const respuesta = await request(app)
      .patch('/api/cotizaciones/40/estado')
      .set('Authorization', bearer(CLIENTE))
      .send({ estado: 'enviada' });
    expect(respuesta.status).toBe(403);
  });

  test('al enviarla, sus solicitudes quedan atendidas y el cliente recibe el aviso', async () => {
    const respuesta = await request(app)
      .patch('/api/cotizaciones/40/estado')
      .set('Authorization', bearer(ADMIN))
      .send({ estado: 'enviada' });

    expect(respuesta.status).toBe(200);
    expect(cotizaciones.cambiarEstado).toHaveBeenCalledWith(40, 'enviada', 'cx');
    expect(solicitudes.atenderPorCotizacion).toHaveBeenCalledWith(40, 'cx');
    expect(pendientes.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: CLIENTE.id, tipo: 'cotizacion', descripcion: 'Tu cotización de ventanas está «Enviada».' }),
      'cx',
    );
  });

  test('pasarla a revisión no cierra sus solicitudes', async () => {
    await request(app).patch('/api/cotizaciones/40/estado').set('Authorization', bearer(ADMIN)).send({ estado: 'en_revision' });
    expect(solicitudes.atenderPorCotizacion).not.toHaveBeenCalled();
  });

  test('el mismo estado que ya tiene responde 400', async () => {
    const respuesta = await request(app)
      .patch('/api/cotizaciones/40/estado')
      .set('Authorization', bearer(ADMIN))
      .send({ estado: 'recibida' });
    expect(respuesta.status).toBe(400);
    expect(cotizaciones.cambiarEstado).not.toHaveBeenCalled();
  });
});

describe('GET /api/cotizaciones/archivos/:id/ver', () => {
  const carpeta = path.join(process.env.UPLOADS_DIR, 'cotizaciones');

  test('el personal ve el plano dentro del portal; otro cliente recibe 404', async () => {
    fs.mkdirSync(carpeta, { recursive: true });
    fs.writeFileSync(path.join(carpeta, 'plano-prueba.pdf'), '%PDF-1.4 plano');
    cotizaciones.buscarArchivo.mockResolvedValue({
      id: 3, cotizacionId: 40, nombre: 'plano.pdf', ruta: 'cotizaciones/plano-prueba.pdf', tipoMime: 'application/pdf',
    });

    const admin = await request(app).get('/api/cotizaciones/archivos/3/ver').set('Authorization', bearer(ADMIN));
    const ajeno = await request(app).get('/api/cotizaciones/archivos/3/ver').set('Authorization', bearer(OTRO_CLIENTE));

    expect(admin.status).toBe(200);
    expect(admin.headers['content-type']).toBe('application/pdf');
    expect(admin.headers['content-disposition']).toMatch(/^inline/);
    expect(ajeno.status).toBe(404);
  });

  test('un archivo que no existe responde 404', async () => {
    cotizaciones.buscarArchivo.mockResolvedValue(null);
    const respuesta = await request(app).get('/api/cotizaciones/archivos/999/ver').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(404);
  });
});

describe('POST /api/proyectos con cotizacionId: el proyecto nace de la cotización', () => {
  const NUEVO = { empresaId: CLIENTE.empresaId, nombre: 'Ventanas · Blvd. Campestre', tipoTrabajo: 'ventanas', cotizacionId: 40 };

  beforeEach(() => {
    empresas.buscarPorId.mockResolvedValue({ id: CLIENTE.empresaId, nombre: 'Constructora Alba' });
    proyectos.crear.mockResolvedValue(12);
  });

  test('liga la cotización y sus solicitudes con el proyecto nuevo', async () => {
    const respuesta = await request(app).post('/api/proyectos').set('Authorization', bearer(ADMIN)).send(NUEVO);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.proyecto).toMatchObject({ id: 12, cotizacionId: 40 });
    expect(proyectos.crear).toHaveBeenCalledWith(expect.not.objectContaining({ cotizacionId: 40 }), 'cx');
    expect(cotizaciones.ligarProyecto).toHaveBeenCalledWith(40, 12, 'cx');
    expect(solicitudes.ligarProyectoPorCotizacion).toHaveBeenCalledWith(40, 12, 'cx');
  });

  test('una cotización que ya tiene proyecto responde 409', async () => {
    cotizaciones.buscarPorId.mockResolvedValue({ ...COTIZACION, proyectoId: 8 });
    const respuesta = await request(app).post('/api/proyectos').set('Authorization', bearer(ADMIN)).send(NUEVO);
    expect(respuesta.status).toBe(409);
    expect(proyectos.crear).not.toHaveBeenCalled();
  });

  test('la empresa tiene que ser la del cliente que pidió la cotización', async () => {
    empresas.buscarPorId.mockResolvedValue({ id: 99, nombre: 'Otra' });
    const respuesta = await request(app)
      .post('/api/proyectos')
      .set('Authorization', bearer(ADMIN))
      .send({ ...NUEVO, empresaId: 99 });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.empresaId).toMatch(/cliente que pidió la cotización/);
  });
});
