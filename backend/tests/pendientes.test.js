jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/pendientes.repository');

const request = require('supertest');
const { crearApp } = require('../src/app');
const pendientes = require('../src/repositories/pendientes.repository');
const { bearer, CLIENTE } = require('./ayudas');

const app = crearApp();

beforeEach(() => jest.clearAllMocks());

describe('campana de pendientes (RF-18)', () => {
  test('devuelve cuántos pendientes tiene el usuario y cuáles son', async () => {
    pendientes.listarSinLeer.mockResolvedValue([
      { id: 2, tipo: 'actualizacion', descripcion: 'Torre Alba: Nueva actualización' },
      { id: 1, tipo: 'mensaje', descripcion: 'Torre Alba: Laura respondió tu duda' },
    ]);
    const respuesta = await request(app).get('/api/pendientes').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.total).toBe(2);
    expect(pendientes.listarSinLeer).toHaveBeenCalledWith(CLIENTE.id);
  });

  test('al abrir un pendiente se marca como leído (HU-22)', async () => {
    pendientes.marcarLeido.mockResolvedValue(1);
    const respuesta = await request(app).patch('/api/pendientes/2/leido').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(204);
    expect(pendientes.marcarLeido).toHaveBeenCalledWith(2, CLIENTE.id);
  });

  test('no se puede marcar el pendiente de otra persona', async () => {
    pendientes.marcarLeido.mockResolvedValue(0);
    const respuesta = await request(app).patch('/api/pendientes/50/leido').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(404);
  });

  test('marca todos como leídos', async () => {
    pendientes.marcarTodosLeidos.mockResolvedValue(3);
    const respuesta = await request(app).patch('/api/pendientes/leidos').set('Authorization', bearer(CLIENTE));
    expect(respuesta.body.marcados).toBe(3);
  });

  test('pide sesión', async () => {
    const respuesta = await request(app).get('/api/pendientes');
    expect(respuesta.status).toBe(401);
  });
});
