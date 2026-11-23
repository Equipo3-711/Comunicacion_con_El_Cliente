const request = require('supertest');
const { crearApp } = require('../src/app');

const app = crearApp();

describe('API base', () => {
  test('GET /api/salud responde que el servicio está arriba', async () => {
    const respuesta = await request(app).get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ ok: true, servicio: 'portal-proyectos-api' });
  });

  test('una ruta que no existe responde 404 con mensaje', async () => {
    const respuesta = await request(app).get('/api/no-existe');
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toBe('La ruta no existe.');
  });

  test('un JSON mal formado responde 400', async () => {
    const respuesta = await request(app)
      .post('/api/salud')
      .set('Content-Type', 'application/json')
      .send('{"mal":');
    expect(respuesta.status).toBe(400);
  });
});
