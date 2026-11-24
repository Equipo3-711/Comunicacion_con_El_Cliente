// Fotos opcionales en las actualizaciones: el cliente ve el avance en fotografías (RF-07).
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const actualizaciones = require('../src/repositories/actualizaciones.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();
const carpetaFotos = path.join(process.env.UPLOADS_DIR, 'fotos');
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const archivosEnFotos = () => (fs.existsSync(carpetaFotos) ? fs.readdirSync(carpetaFotos).length : 0);

beforeEach(() => {
  jest.clearAllMocks();
  proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId, responsableId: ADMIN.id });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([]);
  actualizaciones.crear.mockResolvedValue(55);
});

describe('registrar una actualización con fotos', () => {
  test('guarda cada foto ligada a la actualización', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(ADMIN))
      .field('descripcion', 'Se instalaron 2 de 3 ventanas.')
      .attach('fotos', PNG, { filename: 'ventana-1.png', contentType: 'image/png' })
      .attach('fotos', PNG, { filename: 'ventana-2.png', contentType: 'image/png' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.actualizacion).toMatchObject({ id: 55, tipo: 'avance', fotos: 2 });
    expect(actualizaciones.agregarFoto).toHaveBeenCalledTimes(2);
    expect(actualizaciones.agregarFoto).toHaveBeenCalledWith(
      expect.objectContaining({ actualizacionId: 55, tipoMime: 'image/png', ruta: expect.stringMatching(/^fotos\/.+\.png$/) }),
      'cx',
    );
  });

  test('rechaza un PDF como foto y no deja el archivo guardado', async () => {
    const antes = archivosEnFotos();

    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(ADMIN))
      .field('descripcion', 'Plano final')
      .attach('fotos', Buffer.from('%PDF-1.4'), { filename: 'plano.pdf', contentType: 'application/pdf' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe('Las fotos deben ser imágenes JPG, PNG o WEBP.');
    expect(actualizaciones.crear).not.toHaveBeenCalled();
    expect(archivosEnFotos()).toBe(antes);
  });

  test('si falta la descripción, también borra las fotos recibidas', async () => {
    const antes = archivosEnFotos();

    const respuesta = await request(app)
      .post('/api/proyectos/7/actualizaciones')
      .set('Authorization', bearer(ADMIN))
      .attach('fotos', PNG, { filename: 'ventana.png', contentType: 'image/png' });

    expect(respuesta.status).toBe(400);
    expect(archivosEnFotos()).toBe(antes);
  });
});

describe('ver las fotos en el historial', () => {
  test('cada evento del historial trae los ids de sus fotos', async () => {
    actualizaciones.listarPorProyecto.mockResolvedValue([{ id: 55, tipo: 'avance' }, { id: 54, tipo: 'documento' }]);
    actualizaciones.listarFotosPorProyecto.mockResolvedValue([{ id: 3, actualizacionId: 55 }, { id: 4, actualizacionId: 55 }]);

    const respuesta = await request(app).get('/api/proyectos/7/historial').set('Authorization', bearer(CLIENTE));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.historial).toEqual([{ id: 55, tipo: 'avance', fotos: [3, 4] }, { id: 54, tipo: 'documento', fotos: [] }]);
  });

  test('el cliente ve la foto de su proyecto, pero no la de otra empresa', async () => {
    fs.mkdirSync(carpetaFotos, { recursive: true });
    fs.writeFileSync(path.join(carpetaFotos, 'avance-prueba.png'), PNG);
    actualizaciones.buscarFoto.mockResolvedValue({ id: 3, ruta: 'fotos/avance-prueba.png', tipoMime: 'image/png', proyectoId: 7 });

    const propia = await request(app).get('/api/fotos/3/ver').set('Authorization', bearer(CLIENTE));
    const ajena = await request(app).get('/api/fotos/3/ver').set('Authorization', bearer(OTRO_CLIENTE));

    expect(propia.status).toBe(200);
    expect(propia.headers['content-type']).toBe('image/png');
    expect(ajena.status).toBe(404);
  });

  test('una foto que no existe responde 404', async () => {
    actualizaciones.buscarFoto.mockResolvedValue(null);
    const respuesta = await request(app).get('/api/fotos/999/ver').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(404);
  });
});
