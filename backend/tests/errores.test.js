// Lo que recibe quien usa la API cuando algo sale mal.
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/usuarios.repository');

const request = require('supertest');
const { crearApp } = require('../src/app');
const usuarios = require('../src/repositories/usuarios.repository');

const app = crearApp();

describe('manejo de errores', () => {
  test('un JSON mal escrito responde 400 con un mensaje claro', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"correo": ');

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe('El cuerpo de la petición no es un JSON válido.');
  });

  test('un error inesperado responde 500 sin mostrar el detalle interno', async () => {
    usuarios.buscarPorCorreo.mockRejectedValue(new Error('detalle interno de la base de datos'));
    const consola = jest.spyOn(console, 'error').mockImplementation(() => {});

    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'ana@alba.mx', contrasena: 'cualquiera1' });

    expect(respuesta.status).toBe(500);
    expect(respuesta.body.error).toBe('Ocurrió un error en el servidor. Intenta de nuevo en unos minutos.');
    expect(JSON.stringify(respuesta.body)).not.toContain('detalle interno');
    consola.mockRestore();
  });

  test('una ruta que no existe responde 404', async () => {
    const respuesta = await request(app).get('/api/no-existe');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toBe('La ruta no existe.');
  });
});
