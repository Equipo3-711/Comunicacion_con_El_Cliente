// Semáforo de atención de las dudas: No atendido, Pendiente y Atendido.
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/mensajes.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const request = require('supertest');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const mensajes = require('../src/repositories/mensajes.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();
const proyectoCon = (atencion) => ({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId, responsableId: ADMIN.id, atencion });

beforeEach(() => {
  jest.clearAllMocks();
  usuarios.listarClientesDeEmpresa.mockResolvedValue([{ id: CLIENTE.id, nombre: CLIENTE.nombre, correo: 'marcos@alba.mx' }]);
  mensajes.crear.mockResolvedValue(30);
});

describe('cambio automático con el chat', () => {
  test('una duda nueva del cliente deja el proyecto «No atendido»', async () => {
    proyectos.buscarPorId.mockResolvedValue(proyectoCon('atendido'));

    await request(app).post('/api/proyectos/7/mensajes').set('Authorization', bearer(CLIENTE)).send({ texto: '¿Cuándo instalan?' });

    expect(proyectos.actualizarAtencion).toHaveBeenCalledWith(7, 'no_atendido', 'cx');
  });

  test('cuando el arquitecto responde, pasa de «No atendido» a «Pendiente»', async () => {
    proyectos.buscarPorId.mockResolvedValue(proyectoCon('no_atendido'));

    await request(app).post('/api/proyectos/7/mensajes').set('Authorization', bearer(ADMIN)).send({ texto: 'El jueves a las 10:00.' });

    expect(proyectos.actualizarAtencion).toHaveBeenCalledWith(7, 'pendiente', 'cx');
  });

  test('si ya estaba «Atendido», la respuesta del arquitecto no lo cambia', async () => {
    proyectos.buscarPorId.mockResolvedValue(proyectoCon('atendido'));

    await request(app).post('/api/proyectos/7/mensajes').set('Authorization', bearer(ADMIN)).send({ texto: 'Gracias a ti.' });

    expect(proyectos.actualizarAtencion).not.toHaveBeenCalled();
  });
});

describe('cambio manual del arquitecto', () => {
  test('el arquitecto marca el proyecto como «Atendido»', async () => {
    proyectos.buscarPorId.mockResolvedValue(proyectoCon('pendiente'));

    const respuesta = await request(app)
      .patch('/api/proyectos/7/atencion')
      .set('Authorization', bearer(ADMIN))
      .send({ atencion: 'atendido' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.proyecto.atencion).toBe('atendido');
    expect(proyectos.actualizarAtencion).toHaveBeenCalledWith(7, 'atendido');
  });

  test('rechaza un estado que no existe', async () => {
    proyectos.buscarPorId.mockResolvedValue(proyectoCon('pendiente'));

    const respuesta = await request(app)
      .patch('/api/proyectos/7/atencion')
      .set('Authorization', bearer(ADMIN))
      .send({ atencion: 'olvidado' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles).toHaveProperty('atencion');
    expect(proyectos.actualizarAtencion).not.toHaveBeenCalled();
  });

  test('el cliente no puede cambiar el semáforo', async () => {
    const propio = await request(app).patch('/api/proyectos/7/atencion').set('Authorization', bearer(CLIENTE)).send({ atencion: 'atendido' });
    const ajeno = await request(app).patch('/api/proyectos/7/atencion').set('Authorization', bearer(OTRO_CLIENTE)).send({ atencion: 'atendido' });

    expect(propio.status).toBe(403);
    expect(ajeno.status).toBe(403);
    expect(proyectos.actualizarAtencion).not.toHaveBeenCalled();
  });
});
