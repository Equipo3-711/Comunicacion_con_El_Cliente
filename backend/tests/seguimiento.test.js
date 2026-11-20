jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/repositories/actividades.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const request = require('supertest');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const actualizaciones = require('../src/repositories/actualizaciones.repository');
const actividades = require('../src/repositories/actividades.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const pendientes = require('../src/repositories/pendientes.repository');
const correo = require('../src/utils/correo');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();

beforeEach(() => {
  jest.clearAllMocks();
  proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId, estado: 'en_proceso' });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([{ id: CLIENTE.id, nombre: CLIENTE.nombre, correo: 'marcos@alba.mx' }]);
  actualizaciones.crear.mockResolvedValue(55);
  correo.enviar.mockResolvedValue(true);
});

describe('actualizaciones estructuradas (RF-16, CC-04)', () => {
  test('el personal registra un avance con tipo, descripción y responsable', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(ADMIN))
      .send({ tipo: 'avance', descripcion: 'Se instaló el 60 % de los marcos en el nivel 2.' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.actualizacion).toMatchObject({ id: 55, tipo: 'avance', responsable: ADMIN.nombre });
    expect(pendientes.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: CLIENTE.id, tipo: 'actualizacion' }), 'cx');
    expect(correo.enviar).toHaveBeenCalledTimes(1);
  });

  test('sin tipo, se registra como avance', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(ADMIN))
      .send({ descripcion: 'Llegó el vidrio templado.' });
    expect(respuesta.body.actualizacion.tipo).toBe('avance');
  });

  test('el cliente no puede publicar actualizaciones', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(CLIENTE))
      .send({ descripcion: 'Hola' });
    expect(respuesta.status).toBe(403);
  });

  test('pide la descripción y rechaza tipos que pone el sistema', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(ADMIN))
      .send({ tipo: 'cambio_estado' });
    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles).sort()).toEqual(['descripcion', 'tipo']);
  });
});

describe('actividades realizadas (RF-17, CC-07)', () => {
  test('el cliente ve las actividades de su proyecto, pero no las de otra empresa', async () => {
    actividades.listarPorProyecto.mockResolvedValue([{ id: 3, descripcion: 'Colocar marcos', realizada: false }]);
    const propio = await request(app).get('/api/proyectos/7/actividades').set('Authorization', bearer(CLIENTE));
    const ajeno = await request(app).get('/api/proyectos/7/actividades').set('Authorization', bearer(OTRO_CLIENTE));
    expect(propio.body.actividades).toHaveLength(1);
    expect(ajeno.status).toBe(404);
  });

  test('el personal crea una actividad pendiente', async () => {
    actividades.crear.mockResolvedValue(3);
    const respuesta = await request(app)
      .post('/api/proyectos/7/actividades')
      .set('Authorization', bearer(ADMIN))
      .send({ descripcion: 'Colocar marcos del nivel 3' });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.actividad).toMatchObject({ id: 3, realizada: false });
  });

  test('marcarla como realizada la publica en el historial del cliente sin conversación', async () => {
    actividades.buscarPorId.mockResolvedValue({ id: 3, proyectoId: 7, descripcion: 'Colocar marcos del nivel 3', realizada: false });
    actividades.marcarRealizada.mockResolvedValue(1);

    const respuesta = await request(app).patch('/api/actividades/3/realizada').set('Authorization', bearer(ADMIN));

    expect(respuesta.status).toBe(200);
    expect(actividades.marcarRealizada).toHaveBeenCalledWith(3, ADMIN.id, 'cx');
    expect(actualizaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ proyectoId: 7, tipo: 'avance', descripcion: 'Se terminó: Colocar marcos del nivel 3.' }),
      'cx',
    );
    expect(pendientes.crear).toHaveBeenCalledTimes(1);
    expect(correo.enviar).toHaveBeenCalledWith(expect.objectContaining({ para: 'marcos@alba.mx' }));
  });

  test('no se puede marcar dos veces', async () => {
    actividades.buscarPorId.mockResolvedValue({ id: 3, proyectoId: 7, descripcion: 'X', realizada: true });
    const respuesta = await request(app).patch('/api/actividades/3/realizada').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(409);
    expect(actualizaciones.crear).not.toHaveBeenCalled();
  });

  test('una actividad que no existe responde 404', async () => {
    actividades.buscarPorId.mockResolvedValue(null);
    const respuesta = await request(app).patch('/api/actividades/99/realizada').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(404);
  });
});
