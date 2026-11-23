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
const pendientes = require('../src/repositories/pendientes.repository');
const correo = require('../src/utils/correo');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();

beforeEach(() => {
  jest.clearAllMocks();
  proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId, responsableId: ADMIN.id });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([{ id: CLIENTE.id, nombre: CLIENTE.nombre, correo: 'marcos@alba.mx' }]);
  mensajes.crear.mockResolvedValue(30);
});

describe('chat del proyecto, solo para dudas', () => {
  test('la duda del cliente le aparece al responsable en su campana', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/mensajes')
      .set('Authorization', bearer(CLIENTE))
      .send({ texto: '¿La visita de medición sigue para el jueves?' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.mensaje).toMatchObject({ id: 30, rolAutor: 'cliente' });
    expect(pendientes.crear).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: ADMIN.id, tipo: 'mensaje', descripcion: 'Torre Alba: Nueva duda de Marcos Ruiz' }),
      'cx',
    );
  });

  test('la respuesta del personal le aparece al cliente, sin correo', async () => {
    await request(app).post('/api/proyectos/7/mensajes').set('Authorization', bearer(ADMIN)).send({ texto: 'Sí, a las 9:00.' });
    expect(pendientes.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: CLIENTE.id, tipo: 'mensaje' }), 'cx');
    expect(correo.enviar).not.toHaveBeenCalled();
  });

  test('no acepta mensajes vacíos', async () => {
    const respuesta = await request(app).post('/api/proyectos/7/mensajes').set('Authorization', bearer(CLIENTE)).send({ texto: '   ' });
    expect(respuesta.status).toBe(400);
    expect(mensajes.crear).not.toHaveBeenCalled();
  });

  test('un cliente de otra empresa no ve ni escribe en el chat', async () => {
    const lectura = await request(app).get('/api/proyectos/7/mensajes').set('Authorization', bearer(OTRO_CLIENTE));
    const escritura = await request(app).post('/api/proyectos/7/mensajes').set('Authorization', bearer(OTRO_CLIENTE)).send({ texto: 'Hola' });
    expect(lectura.status).toBe(404);
    expect(escritura.status).toBe(404);
  });
});
