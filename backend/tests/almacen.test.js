// En Vercel, fotos y documentos se guardan en Vercel Blob como privados (utils/almacen.js).
// Con BLOB_READ_WRITE_TOKEN la API usa Blob; aquí Blob es falso y no sale nada a internet.
process.env.BLOB_READ_WRITE_TOKEN = 'token-falso-de-prueba';

jest.mock('@vercel/blob', () => ({ put: jest.fn(), get: jest.fn(), del: jest.fn() }));
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/documentos.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const blob = require('@vercel/blob');
const config = require('../src/config/env');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const documentos = require('../src/repositories/documentos.repository');
const actualizaciones = require('../src/repositories/actualizaciones.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const { bearer, ADMIN, CLIENTE } = require('./ayudas');

const app = crearApp();
const PDF = Buffer.from('%PDF-1.4 contrato de prueba');
const PRIVADO = { access: 'private' };

const flujoDe = (texto) => new ReadableStream({
  start(controlador) {
    controlador.enqueue(new TextEncoder().encode(texto));
    controlador.close();
  },
});

afterAll(() => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

beforeEach(() => {
  jest.clearAllMocks();
  blob.put.mockResolvedValue({});
  blob.del.mockResolvedValue();
  proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([]);
  actualizaciones.crear.mockResolvedValue(30);
});

const subirContrato = (contenido = PDF) => request(app)
  .post('/api/proyectos/7/documentos')
  .set('Authorization', bearer(ADMIN))
  .attach('archivo', contenido, { filename: 'contrato.pdf', contentType: 'application/pdf' });

describe('subir a Vercel Blob', () => {
  test('el documento se guarda privado, con la misma ruta que queda en la base, y no se queda en el disco', async () => {
    documentos.crear.mockResolvedValue(11);

    const respuesta = await subirContrato();

    expect(respuesta.status).toBe(201);
    const [ruta, contenido, opciones] = blob.put.mock.calls[0];
    expect(ruta).toMatch(/^documentos\/[0-9a-f-]{36}\.pdf$/);
    expect(contenido.equals(PDF)).toBe(true);
    expect(opciones).toEqual({ ...PRIVADO, contentType: 'application/pdf', addRandomSuffix: false });
    expect(documentos.crear.mock.calls[0][0].ruta).toBe(ruta);
    expect(fs.existsSync(path.join(config.archivos.carpeta, ruta))).toBe(false);
  });

  test('un archivo falso no llega a Blob', async () => {
    const respuesta = await subirContrato(Buffer.from('MZ esto es un programa'));

    expect(respuesta.status).toBe(400);
    expect(blob.put).not.toHaveBeenCalled();
  });

  test('si no se puede guardar en la base, el archivo se borra de Blob', async () => {
    documentos.crear.mockRejectedValue(new Error('sin conexión'));

    const respuesta = await subirContrato();

    expect(respuesta.status).toBe(500);
    const [ruta] = blob.put.mock.calls[0];
    expect(blob.del).toHaveBeenCalledWith([ruta]);
  });

  test('si Blob falla, responde con error y no se guarda nada en la base', async () => {
    blob.put.mockRejectedValue(new Error('Blob no disponible'));

    const respuesta = await subirContrato();

    expect(respuesta.status).toBe(500);
    expect(documentos.crear).not.toHaveBeenCalled();
  });
});

describe('ver desde Vercel Blob', () => {
  const CONTRATO = { id: 4, proyectoId: 7, nombre: 'Contrato firmado', ruta: 'documentos/contrato.pdf', tipoMime: 'application/pdf' };

  test('la API lee el documento privado y lo muestra dentro del portal, sin caché', async () => {
    documentos.buscarPorId.mockResolvedValue({ ...CONTRATO });
    blob.get.mockResolvedValue({ statusCode: 200, stream: flujoDe('%PDF-1.4 desde Blob') });

    const respuesta = await request(app).get('/api/documentos/4/ver').set('Authorization', bearer(CLIENTE));

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toContain('application/pdf');
    expect(respuesta.headers['content-disposition']).toMatch(/^inline/);
    expect(respuesta.headers['cache-control']).toBe('no-store');
    expect(Buffer.from(respuesta.body).toString()).toBe('%PDF-1.4 desde Blob');
    expect(blob.get).toHaveBeenCalledWith('documentos/contrato.pdf', { ...PRIVADO, useCache: false });
  });

  test('si ya no está en Blob, lo dice con 404', async () => {
    documentos.buscarPorId.mockResolvedValue({ ...CONTRATO });
    blob.get.mockResolvedValue(null);

    const respuesta = await request(app).get('/api/documentos/4/ver').set('Authorization', bearer(ADMIN));

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toBe('El archivo del documento ya no está disponible.');
  });

  test('un cliente de otra empresa no llega a pedirlo a Blob', async () => {
    documentos.buscarPorId.mockResolvedValue({ ...CONTRATO });
    proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: 999 });

    const respuesta = await request(app).get('/api/documentos/4/ver').set('Authorization', bearer(CLIENTE));

    expect(respuesta.status).toBe(404);
    expect(blob.get).not.toHaveBeenCalled();
  });
});
