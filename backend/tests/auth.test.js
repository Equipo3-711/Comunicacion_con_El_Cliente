jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/empresas.repository');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { crearApp } = require('../src/app');
const usuarios = require('../src/repositories/usuarios.repository');
const empresas = require('../src/repositories/empresas.repository');
const { bearer, CLIENTE } = require('./ayudas');

const app = crearApp();

const registroValido = {
  nombre: 'Marcos Ruiz',
  empresa: 'Constructora Alba',
  correo: 'Marcos@ConstructoraAlba.mx',
  telefono: '477 123 4567',
  contrasena: 'ventanas2026',
  confirmarContrasena: 'ventanas2026',
};

beforeEach(() => jest.clearAllMocks());

describe('POST /api/auth/registro', () => {
  test('marca todos los campos que faltan', async () => {
    const respuesta = await request(app).post('/api/auth/registro').send({});
    expect(respuesta.status).toBe(400);
    expect(Object.keys(respuesta.body.detalles)).toEqual(
      expect.arrayContaining(['nombre', 'empresa', 'correo', 'telefono', 'contrasena', 'confirmarContrasena']),
    );
  });

  test('rechaza contraseñas que no coinciden', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ ...registroValido, confirmarContrasena: 'otra-cosa' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.confirmarContrasena).toBe('Las contraseñas no coinciden.');
  });

  test('no permite dos cuentas con el mismo correo', async () => {
    usuarios.buscarPorCorreo.mockResolvedValue({ id: 9 });
    const respuesta = await request(app).post('/api/auth/registro').send(registroValido);
    expect(respuesta.status).toBe(409);
  });

  test('crea la empresa y la cuenta de cliente, y devuelve la sesión', async () => {
    usuarios.buscarPorCorreo.mockResolvedValue(null);
    empresas.crear.mockResolvedValue(10);
    usuarios.crear.mockResolvedValue(2);

    const respuesta = await request(app).post('/api/auth/registro').send(registroValido);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.token).toEqual(expect.any(String));
    expect(respuesta.body.usuario).toMatchObject({ id: 2, rol: 'cliente', empresaId: 10, correo: 'marcos@constructoraalba.mx' });
    const guardado = usuarios.crear.mock.calls[0][0];
    expect(guardado.rol).toBe('cliente');
    expect(guardado.contrasenaHash).not.toBe(registroValido.contrasena);
    expect(await bcrypt.compare(registroValido.contrasena, guardado.contrasenaHash)).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  test('da el mismo mensaje si el correo no existe o si la contraseña está mal (T-08)', async () => {
    usuarios.buscarPorCorreo.mockResolvedValueOnce(null);
    const sinCuenta = await request(app).post('/api/auth/login').send({ correo: 'nadie@x.mx', contrasena: 'algo1234' });

    const contrasenaHash = await bcrypt.hash('correcta123', 4);
    usuarios.buscarPorCorreo.mockResolvedValueOnce({ ...CLIENTE, correo: 'c@x.mx', contrasenaHash });
    const malaContrasena = await request(app).post('/api/auth/login').send({ correo: 'c@x.mx', contrasena: 'incorrecta' });

    expect(sinCuenta.status).toBe(401);
    expect(malaContrasena.status).toBe(401);
    expect(sinCuenta.body.error).toBe('Correo o contraseña incorrectos.');
    expect(malaContrasena.body.error).toBe(sinCuenta.body.error);
  });

  test('entra con datos correctos y devuelve el rol', async () => {
    const contrasenaHash = await bcrypt.hash('correcta123', 4);
    usuarios.buscarPorCorreo.mockResolvedValue({ ...CLIENTE, correo: 'c@x.mx', contrasenaHash });
    const respuesta = await request(app).post('/api/auth/login').send({ correo: 'C@X.mx', contrasena: 'correcta123' });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario.rol).toBe('cliente');
    expect(respuesta.body.usuario.contrasenaHash).toBeUndefined();
  });
});

describe('GET /api/auth/yo', () => {
  test('pide iniciar sesión si no hay token', async () => {
    const respuesta = await request(app).get('/api/auth/yo');
    expect(respuesta.status).toBe(401);
  });

  test('rechaza un token alterado', async () => {
    const respuesta = await request(app).get('/api/auth/yo').set('Authorization', `${bearer(CLIENTE)}x`);
    expect(respuesta.status).toBe(401);
  });

  test('devuelve la cuenta con sesión', async () => {
    usuarios.buscarPorId.mockResolvedValue({ ...CLIENTE, correo: 'c@x.mx', telefono: null });
    const respuesta = await request(app).get('/api/auth/yo').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario.id).toBe(CLIENTE.id);
  });
});
