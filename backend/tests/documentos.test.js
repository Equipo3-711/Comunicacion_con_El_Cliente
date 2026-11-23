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
const { crearApp } = require('../src/app');
const config = require('../src/config/env');
const proyectos = require('../src/repositories/proyectos.repository');
const documentos = require('../src/repositories/documentos.repository');
const actualizaciones = require('../src/repositories/actualizaciones.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const correo = require('../src/utils/correo');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();
const CONTRATO = { id: 4, proyectoId: 7, nombre: 'Contrato firmado', ruta: 'documentos/contrato-prueba.pdf', tipoMime: 'application/pdf' };

beforeAll(() => {
  const carpeta = path.join(config.archivos.carpeta, 'documentos');
  fs.mkdirSync(carpeta, { recursive: true });
  fs.writeFileSync(path.join(carpeta, 'contrato-prueba.pdf'), '%PDF-1.4 contrato');
});

beforeEach(() => {
  jest.clearAllMocks();
  proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId });
  documentos.buscarPorId.mockResolvedValue({ ...CONTRATO });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([{ id: CLIENTE.id, nombre: CLIENTE.nombre, correo: 'marcos@alba.mx' }]);
  correo.enviar.mockResolvedValue(true);
});

describe('ver documentos sin descargarlos (CC-02)', () => {
  test('el cliente ve el documento dentro del portal, sin descarga ni caché', async () => {
    const respuesta = await request(app).get('/api/documentos/4/ver').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toContain('application/pdf');
    expect(respuesta.headers['content-disposition']).toMatch(/^inline/);
    expect(respuesta.headers['cache-control']).toBe('no-store');
  });

  test('sin sesión no se puede ver', async () => {
    const respuesta = await request(app).get('/api/documentos/4/ver');
    expect(respuesta.status).toBe(401);
  });

  test('un cliente de otra empresa no puede ver el documento', async () => {
    const respuesta = await request(app).get('/api/documentos/4/ver').set('Authorization', bearer(OTRO_CLIENTE));
    expect(respuesta.status).toBe(404);
  });

  test('si falta el archivo en el servidor, lo dice', async () => {
    documentos.buscarPorId.mockResolvedValue({ ...CONTRATO, ruta: 'documentos/no-existe.pdf' });
    const respuesta = await request(app).get('/api/documentos/4/ver').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(404);
  });
});

describe('subir documentos', () => {
  test('el personal sube un PDF, queda en el historial y avisa al cliente', async () => {
    documentos.crear.mockResolvedValue(9);
    const respuesta = await request(app)
      .post('/api/proyectos/7/documentos')
      .set('Authorization', bearer(ADMIN))
      .field('nombre', 'Cotización final')
      .attach('archivo', Buffer.from('%PDF-1.4'), { filename: 'cotizacion.pdf', contentType: 'application/pdf' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.documento).toMatchObject({ id: 9, nombre: 'Cotización final' });
    expect(actualizaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'documento', descripcion: 'Se agregó el documento «Cotización final».' }),
      'cx',
    );
    expect(correo.enviar).toHaveBeenCalledTimes(1);
  });

  test('un cliente no puede subir documentos', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/documentos')
      .set('Authorization', bearer(CLIENTE))
      .attach('archivo', Buffer.from('%PDF-1.4'), { filename: 'x.pdf', contentType: 'application/pdf' });
    expect(respuesta.status).toBe(403);
  });

  test('pide el archivo', async () => {
    const respuesta = await request(app).post('/api/proyectos/7/documentos').set('Authorization', bearer(ADMIN)).send({});
    expect(respuesta.status).toBe(400);
  });

  test('el cliente lista los documentos de su proyecto', async () => {
    documentos.listarPorProyecto.mockResolvedValue([{ id: 4, nombre: 'Contrato firmado' }]);
    const respuesta = await request(app).get('/api/proyectos/7/documentos').set('Authorization', bearer(CLIENTE));
    expect(respuesta.body.documentos).toHaveLength(1);
  });
});
