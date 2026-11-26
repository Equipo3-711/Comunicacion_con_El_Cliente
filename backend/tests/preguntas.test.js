// Preguntas frecuentes con respuesta automática (RF-13): las configura el personal y el chat del cliente las sugiere.
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/preguntas.repository');

const request = require('supertest');
const { crearApp } = require('../src/app');
const preguntas = require('../src/repositories/preguntas.repository');
const { normalizar, puntaje } = require('../src/services/preguntas.service');
const { bearer, ADMIN, CLIENTE } = require('./ayudas');

const app = crearApp();

const GARANTIA = {
  id: 1, pregunta: '¿Qué garantía tienen?', respuesta: '2 años en herrajes.', palabrasClave: 'garantía, se rompe', activa: true, resueltas: 4,
};
const INSTALACION = {
  id: 2, pregunta: '¿Cuánto tarda la instalación?', respuesta: 'De 1 a 2 días.', palabrasClave: 'cuánto tarda, instalación, fecha', activa: true, resueltas: 9,
};
const PAGO = {
  id: 3, pregunta: '¿Cómo pago?', respuesta: 'Transferencia o tarjeta.', palabrasClave: 'pago, pagar, anticipo', activa: true, resueltas: 0,
};
const NUEVA = { pregunta: '¿Hacen canceles?', respuesta: 'Sí, de vidrio templado.', palabrasClave: ' cancel ,, canceles , baño ' };

beforeEach(() => {
  jest.clearAllMocks();
  preguntas.listar.mockImplementation(async ({ soloActivas } = {}) => (soloActivas ? [GARANTIA, INSTALACION, PAGO] : [GARANTIA, INSTALACION, PAGO, { id: 4, activa: false }]));
  preguntas.buscarPorId.mockImplementation(async (id) => ({ ...NUEVA, id, activa: true, resueltas: 0 }));
  preguntas.crear.mockResolvedValue(9);
  preguntas.sumarResuelta.mockResolvedValue(1);
});

describe('cómo se compara la duda con las palabras clave', () => {
  test('sin acentos, mayúsculas ni signos', () => {
    expect(normalizar('¿Cuánto DURA la Garantía?')).toBe('cuanto dura la garantia');
  });

  test('una palabra encuentra su plural; una frase tiene que aparecer completa', () => {
    expect(puntaje(GARANTIA, 'Las garantías cubren el vidrio?')).toBe(1);
    expect(puntaje(GARANTIA, 'se me rompe la manija')).toBe(0);
    expect(puntaje(GARANTIA, '¿Y si SE ROMPE?')).toBe(1);
    expect(puntaje(INSTALACION, '¿cuánto tarda la instalación y en qué fecha?')).toBe(3);
  });
});

describe('GET /api/preguntas/sugerencias: lo que el chat le sugiere al cliente', () => {
  test('ordena por cuántas palabras clave coinciden y solo da pregunta y respuesta', async () => {
    const respuesta = await request(app)
      .get('/api/preguntas/sugerencias')
      .query({ texto: '¿Qué fecha tienen para la instalación? ¿Y la garantía?' })
      .set('Authorization', bearer(CLIENTE));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.sugerencias.map(({ id }) => id)).toEqual([2, 1]);
    expect(respuesta.body.sugerencias[0]).toEqual({ id: 2, pregunta: INSTALACION.pregunta, respuesta: INSTALACION.respuesta });
    expect(preguntas.listar).toHaveBeenCalledWith({ soloActivas: true });
  });

  test('si nada coincide, no sugiere nada y la duda va al arquitecto', async () => {
    const respuesta = await request(app)
      .get('/api/preguntas/sugerencias')
      .query({ texto: 'Hola, buen día' })
      .set('Authorization', bearer(CLIENTE));
    expect(respuesta.body.sugerencias).toEqual([]);
  });

  test('sin texto responde 400; sin sesión, 401', async () => {
    const vacia = await request(app).get('/api/preguntas/sugerencias').set('Authorization', bearer(CLIENTE));
    const sinSesion = await request(app).get('/api/preguntas/sugerencias').query({ texto: 'garantía' });
    expect(vacia.status).toBe(400);
    expect(vacia.body.detalles.texto).toBe('Escribe tu duda.');
    expect(sinSesion.status).toBe(401);
  });
});

describe('GET /api/preguntas', () => {
  test('el cliente ve solo las activas, sin palabras clave ni conteos', async () => {
    const respuesta = await request(app).get('/api/preguntas').set('Authorization', bearer(CLIENTE));
    expect(respuesta.body.preguntas).toHaveLength(3);
    expect(Object.keys(respuesta.body.preguntas[0]).sort()).toEqual(['id', 'pregunta', 'respuesta']);
  });

  test('el personal ve todas, con sus palabras clave y cuántas dudas resolvieron', async () => {
    const respuesta = await request(app).get('/api/preguntas').set('Authorization', bearer(ADMIN));
    expect(respuesta.body.preguntas).toHaveLength(4);
    expect(respuesta.body.preguntas[0]).toMatchObject({ palabrasClave: 'garantía, se rompe', resueltas: 4 });
  });
});

describe('el personal configura las preguntas', () => {
  test('crear limpia las palabras clave', async () => {
    const respuesta = await request(app).post('/api/preguntas').set('Authorization', bearer(ADMIN)).send(NUEVA);

    expect(respuesta.status).toBe(201);
    expect(preguntas.crear).toHaveBeenCalledWith(
      { pregunta: '¿Hacen canceles?', respuesta: 'Sí, de vidrio templado.', palabrasClave: 'cancel, canceles, baño', activa: true },
      ADMIN.id,
    );
  });

  test('marca los campos que faltan', async () => {
    const respuesta = await request(app).post('/api/preguntas').set('Authorization', bearer(ADMIN)).send({ palabrasClave: 'a, b' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles).toMatchObject({
      pregunta: 'Escribe la pregunta.',
      respuesta: 'Escribe la respuesta.',
      palabrasClave: 'Escribe al menos una palabra clave de 3 letras o más.',
    });
    expect(preguntas.crear).not.toHaveBeenCalled();
  });

  test('un cliente no puede crear, cambiar ni borrar preguntas', async () => {
    const crear = await request(app).post('/api/preguntas').set('Authorization', bearer(CLIENTE)).send(NUEVA);
    const cambiar = await request(app).put('/api/preguntas/1').set('Authorization', bearer(CLIENTE)).send(NUEVA);
    const borrar = await request(app).delete('/api/preguntas/1').set('Authorization', bearer(CLIENTE));
    expect([crear.status, cambiar.status, borrar.status]).toEqual([403, 403, 403]);
  });

  test('apagar una pregunta la guarda como inactiva', async () => {
    const respuesta = await request(app).put('/api/preguntas/1').set('Authorization', bearer(ADMIN)).send({ ...NUEVA, activa: false });
    expect(respuesta.status).toBe(200);
    expect(preguntas.actualizar).toHaveBeenCalledWith(1, expect.objectContaining({ activa: false }));
  });

  test('«activa» tiene que ser sí o no', async () => {
    const respuesta = await request(app).put('/api/preguntas/1').set('Authorization', bearer(ADMIN)).send({ ...NUEVA, activa: 'quizá' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.activa).toBeDefined();
  });

  test('borrar una que no existe responde 404', async () => {
    preguntas.buscarPorId.mockResolvedValue(null);
    const respuesta = await request(app).delete('/api/preguntas/99').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(404);
    expect(preguntas.eliminar).not.toHaveBeenCalled();
  });

  test('borrar una que existe responde 204', async () => {
    const respuesta = await request(app).delete('/api/preguntas/3').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(204);
    expect(preguntas.eliminar).toHaveBeenCalledWith(3);
  });
});

describe('POST /api/preguntas/:id/resuelta: «Sí, esto responde mi duda»', () => {
  test('suma una duda resuelta', async () => {
    const respuesta = await request(app).post('/api/preguntas/2/resuelta').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(204);
    expect(preguntas.sumarResuelta).toHaveBeenCalledWith(2);
  });

  test('una pregunta apagada o que no existe responde 404', async () => {
    preguntas.sumarResuelta.mockResolvedValue(0);
    const respuesta = await request(app).post('/api/preguntas/4/resuelta').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(404);
  });
});
