// Un archivo se acepta por su contenido, no por el tipo que dice el navegador.
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/documentos.repository');
jest.mock('../src/repositories/actualizaciones.repository');
jest.mock('../src/repositories/usuarios.repository');
jest.mock('../src/repositories/pendientes.repository');
jest.mock('../src/utils/correo');

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');
const { crearApp } = require('../src/app');
const { coincideFirma, verificarContenido } = require('../src/utils/archivos');
const proyectos = require('../src/repositories/proyectos.repository');
const documentos = require('../src/repositories/documentos.repository');
const usuarios = require('../src/repositories/usuarios.repository');
const { bearer, ADMIN, CLIENTE } = require('./ayudas');

const app = crearApp();
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

beforeEach(() => {
  jest.clearAllMocks();
  proyectos.buscarPorId.mockResolvedValue({ id: 7, nombre: 'Torre Alba', empresaId: CLIENTE.empresaId });
  usuarios.listarClientesDeEmpresa.mockResolvedValue([]);
});

describe('firma de los archivos', () => {
  test('reconoce un PNG y un PDF por sus primeros bytes', () => {
    expect(coincideFirma('image/png', PNG)).toBe(true);
    expect(coincideFirma('application/pdf', Buffer.from('%PDF-1.7'))).toBe(true);
  });

  test('rechaza un contenido que no corresponde al tipo declarado', () => {
    expect(coincideFirma('application/pdf', PNG)).toBe(false);
    expect(coincideFirma('image/jpeg', Buffer.from('MZ programa'))).toBe(false);
  });
});

describe('subir un archivo falso', () => {
  test('un programa con nombre .pdf se rechaza con 400 y no se guarda', async () => {
    const respuesta = await request(app)
      .post('/api/proyectos/7/documentos')
      .set('Authorization', bearer(ADMIN))
      .attach('archivo', Buffer.from('MZ esto es un programa'), { filename: 'contrato.pdf', contentType: 'application/pdf' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe('El archivo no es una imagen JPG, PNG o WEBP ni un PDF válido.');
    expect(documentos.crear).not.toHaveBeenCalled();
  });

  test('el archivo rechazado se borra del servidor', async () => {
    const ruta = path.join(os.tmpdir(), `falso-${Date.now()}.png`);
    fs.writeFileSync(ruta, 'no soy una imagen');
    const siguiente = jest.fn();

    await expect(verificarContenido({ file: { path: ruta, mimetype: 'image/png' } }, {}, siguiente)).rejects.toMatchObject({ estado: 400 });

    expect(fs.existsSync(ruta)).toBe(false);
    expect(siguiente).not.toHaveBeenCalled();
  });

  test('un PNG real sí se acepta', async () => {
    documentos.crear.mockResolvedValue(11);
    const respuesta = await request(app)
      .post('/api/proyectos/7/documentos')
      .set('Authorization', bearer(ADMIN))
      .attach('archivo', PNG, { filename: 'fachada.png', contentType: 'image/png' });

    expect(respuesta.status).toBe(201);
  });
});
