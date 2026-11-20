jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/empresas.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const request = require('supertest');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const empresas = require('../src/repositories/empresas.repository');
const actualizaciones = require('../src/repositories/actualizaciones.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const pendientes = require('../src/repositories/pendientes.repository');
const correo = require('../src/utils/correo');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();

const TORRE_ALBA = {
  id: 7,
  nombre: 'Torre Alba',
  tipoTrabajo: 'fachada',
  estado: 'en_proceso',
  empresaId: CLIENTE.empresaId,
  empresa: 'Constructora Alba',
  presupuesto: 250000,
  pagado: 100000,
  garantiaHasta: '2028-01-31',
  notasInternas: 'Margen del 18 %',
  responsableId: ADMIN.id,
  responsable: ADMIN.nombre,
};

beforeEach(() => {
  jest.clearAllMocks();
  proyectos.buscarPorId.mockResolvedValue({ ...TORRE_ALBA });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([{ id: CLIENTE.id, nombre: CLIENTE.nombre, correo: 'marcos@alba.mx' }]);
  correo.enviar.mockResolvedValue(true);
});

describe('consulta de proyectos (RF-08)', () => {
  test('el cliente lista solo los proyectos de su empresa', async () => {
    proyectos.listarDeEmpresa.mockResolvedValue([{ id: 7 }]);
    const respuesta = await request(app).get('/api/proyectos').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(200);
    expect(proyectos.listarDeEmpresa).toHaveBeenCalledWith(CLIENTE.empresaId);
    expect(proyectos.listarTodos).not.toHaveBeenCalled();
  });

  test('el cliente ve su proyecto sin las notas internas de la empresa (T-06)', async () => {
    const respuesta = await request(app).get('/api/proyectos/7').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.proyecto.presupuesto).toBe(250000);
    expect(respuesta.body.proyecto).not.toHaveProperty('notasInternas');
  });

  test('el personal sí ve las notas internas', async () => {
    const respuesta = await request(app).get('/api/proyectos/7').set('Authorization', bearer(ADMIN));
    expect(respuesta.body.proyecto.notasInternas).toBe('Margen del 18 %');
  });

  test('un cliente de otra empresa recibe "no existe" (RNF-06)', async () => {
    const respuesta = await request(app).get('/api/proyectos/7').set('Authorization', bearer(OTRO_CLIENTE));
    expect(respuesta.status).toBe(404);
  });

  test('un id que no es número responde 404 sin consultar la base', async () => {
    const respuesta = await request(app).get('/api/proyectos/abc').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(404);
    expect(proyectos.buscarPorId).not.toHaveBeenCalled();
  });

  test('el historial sale ordenado desde la base y solo con acceso', async () => {
    actualizaciones.listarPorProyecto.mockResolvedValue([{ id: 2, tipo: 'avance' }, { id: 1, tipo: 'cambio_estado' }]);
    const propio = await request(app).get('/api/proyectos/7/historial').set('Authorization', bearer(CLIENTE));
    const ajeno = await request(app).get('/api/proyectos/7/historial').set('Authorization', bearer(OTRO_CLIENTE));
    expect(propio.body.historial).toHaveLength(2);
    expect(ajeno.status).toBe(404);
  });
});

describe('alta y cambios del proyecto (solo personal)', () => {
  test('un cliente no puede crear proyectos', async () => {
    const respuesta = await request(app).post('/api/proyectos').set('Authorization', bearer(CLIENTE)).send({});
    expect(respuesta.status).toBe(403);
  });

  test('valida empresa, nombre y tipo de trabajo', async () => {
    const respuesta = await request(app).post('/api/proyectos').set('Authorization', bearer(ADMIN)).send({ presupuesto: -5 });
    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles).sort()).toEqual(['empresaId', 'nombre', 'presupuesto', 'tipoTrabajo']);
  });

  test('crea el proyecto, lo deja en el historial y avisa al cliente', async () => {
    empresas.buscarPorId.mockResolvedValue({ id: 10 });
    proyectos.crear.mockResolvedValue(8);
    const respuesta = await request(app)
      .post('/api/proyectos')
      .set('Authorization', bearer(ADMIN))
      .send({ empresaId: 10, nombre: 'Plaza Centro', tipoTrabajo: 'Canceles', presupuesto: '120000' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.proyecto).toMatchObject({ id: 8, estado: 'cotizacion', tipoTrabajo: 'canceles', presupuesto: 120000 });
    expect(actualizaciones.crear).toHaveBeenCalledWith(expect.objectContaining({ proyectoId: 8, tipo: 'cambio_estado' }), 'cx');
    expect(pendientes.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: CLIENTE.id, proyectoId: 8 }), 'cx');
    expect(correo.enviar).toHaveBeenCalledWith(expect.objectContaining({ para: 'marcos@alba.mx' }));
  });

  test('cambiar el estado queda en el historial, en la campana y en el correo (RF-18, RF-19)', async () => {
    const respuesta = await request(app)
      .patch('/api/proyectos/7/estado')
      .set('Authorization', bearer(ADMIN))
      .send({ estado: 'en_instalacion' });

    expect(respuesta.status).toBe(200);
    expect(proyectos.actualizarEstado).toHaveBeenCalledWith(7, 'en_instalacion', 'cx');
    expect(actualizaciones.crear.mock.calls[0][0].descripcion).toBe('El proyecto pasó a «En instalación».');
    expect(pendientes.crear.mock.calls[0][0].descripcion).toBe('Torre Alba: El proyecto pasó a «En instalación».');
    expect(correo.enviar.mock.calls[0][0].texto).toContain('Tipo: Cambio de estado');
  });

  test('no permite poner el mismo estado que ya tiene', async () => {
    const respuesta = await request(app)
      .patch('/api/proyectos/7/estado')
      .set('Authorization', bearer(ADMIN))
      .send({ estado: 'en_proceso' });
    expect(respuesta.status).toBe(400);
    expect(actualizaciones.crear).not.toHaveBeenCalled();
  });

  test('actualiza pagos y garantía', async () => {
    const respuesta = await request(app)
      .patch('/api/proyectos/7')
      .set('Authorization', bearer(ADMIN))
      .send({ pagado: 150000, garantiaHasta: '2028-06-30' });
    expect(respuesta.status).toBe(200);
    expect(proyectos.actualizarDatos).toHaveBeenCalledWith(7, { pagado: 150000, garantiaHasta: '2028-06-30' });
  });
});

describe('GET /api/empresas', () => {
  test('solo el personal ve la lista de empresas', async () => {
    empresas.listar.mockResolvedValue([{ id: 10, nombre: 'Constructora Alba' }]);
    const admin = await request(app).get('/api/empresas').set('Authorization', bearer(ADMIN));
    const cliente = await request(app).get('/api/empresas').set('Authorization', bearer(CLIENTE));
    expect(admin.body.empresas).toHaveLength(1);
    expect(cliente.status).toBe(403);
  });
});
