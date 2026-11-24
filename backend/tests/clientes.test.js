// Botón «Agregar usuario» del arquitecto: alta del cliente con su empresa y su primer proyecto (RF-02).
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/empresas.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const empresas = require('../src/repositories/empresas.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const pendientes = require('../src/repositories/pendientes.repository');
const { bearer, ADMIN, CLIENTE } = require('./ayudas');

const app = crearApp();

const NUEVO = {
  nombre: 'Laura Ramírez',
  empresa: 'Laura Ramírez',
  correo: 'Laura@Ramirez.mx',
  telefono: '477 555 0101',
  contrasena: 'inicial-2026',
  nombreProyecto: 'Canceles · Privada Sauces 8',
  tipoTrabajo: 'canceles',
};

beforeEach(() => {
  jest.clearAllMocks();
  usuarios.buscarPorCorreo.mockResolvedValue(null);
  empresas.crear.mockResolvedValue(40);
  usuarios.crear.mockResolvedValue(15);
  proyectos.crear.mockResolvedValue(9);
  usuarios.listarClientesDeEmpresa.mockResolvedValue([{ id: 15, nombre: NUEVO.nombre, correo: 'laura@ramirez.mx' }]);
});

describe('alta de cliente por el arquitecto', () => {
  test('crea al cliente, su empresa y su proyecto con el arquitecto como responsable', async () => {
    const respuesta = await request(app).post('/api/clientes').set('Authorization', bearer(ADMIN)).send(NUEVO);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.cliente).toMatchObject({ id: 15, correo: 'laura@ramirez.mx', empresaId: 40, empresa: 'Laura Ramírez' });
    expect(respuesta.body.proyecto).toMatchObject({ id: 9, empresaId: 40, responsableId: ADMIN.id, estado: 'cotizacion' });
    expect(proyectos.crear).toHaveBeenCalledWith(
      expect.objectContaining({ empresaId: 40, nombre: NUEVO.nombreProyecto, tipoTrabajo: 'canceles', responsableId: ADMIN.id }),
      'cx',
    );
    expect(pendientes.crear).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: 15, proyectoId: 9 }), 'cx');
  });

  test('guarda la contraseña inicial cifrada, nunca tal cual', async () => {
    await request(app).post('/api/clientes').set('Authorization', bearer(ADMIN)).send(NUEVO);

    const guardado = usuarios.crear.mock.calls[0][0];
    expect(guardado).not.toHaveProperty('contrasena');
    expect(guardado.contrasenaHash).not.toBe(NUEVO.contrasena);
    expect(await bcrypt.compare(NUEVO.contrasena, guardado.contrasenaHash)).toBe(true);
    expect(JSON.stringify(usuarios.crear.mock.calls)).not.toContain(NUEVO.contrasena);
  });

  test('si el correo ya tiene cuenta, responde 409 y no crea nada', async () => {
    usuarios.buscarPorCorreo.mockResolvedValue({ id: 2 });

    const respuesta = await request(app).post('/api/clientes').set('Authorization', bearer(ADMIN)).send(NUEVO);

    expect(respuesta.status).toBe(409);
    expect(empresas.crear).not.toHaveBeenCalled();
    expect(proyectos.crear).not.toHaveBeenCalled();
  });

  test('marca los campos que faltan o están mal', async () => {
    const respuesta = await request(app)
      .post('/api/clientes')
      .set('Authorization', bearer(ADMIN))
      .send({ ...NUEVO, correo: 'sin-arroba', contrasena: 'corta', tipoTrabajo: 'puertas', nombreProyecto: '' });

    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles).sort()).toEqual(['contrasena', 'correo', 'nombreProyecto', 'tipoTrabajo']);
    expect(usuarios.crear).not.toHaveBeenCalled();
  });

  test('un cliente no puede dar de alta a otros clientes', async () => {
    const respuesta = await request(app).post('/api/clientes').set('Authorization', bearer(CLIENTE)).send(NUEVO);
    expect(respuesta.status).toBe(403);
  });
});
