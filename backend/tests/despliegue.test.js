// Lo que cambia al correr en Vercel con una base en la nube; en local todo sigue igual.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');

const respaldo = { ...process.env };

// Ninguna prueba lee el backend/.env de quien las corre: solo cuenta lo que define cada una.
beforeEach(() => {
  process.env.ENV_FILE = path.join(os.tmpdir(), 'portal-sin-archivo.env');
  for (const nombre of ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_SSL', 'DB_SSL_CA', 'DB_TIMEZONE', 'BLOB_READ_WRITE_TOKEN', 'VERCEL']) {
    delete process.env[nombre];
  }
});

afterEach(() => {
  process.env = { ...respaldo };
  jest.resetModules();
  jest.restoreAllMocks();
});

// Carga un módulo desde cero con las variables de entorno que tenga la prueba.
function cargar(ruta) {
  let modulo;
  jest.isolateModules(() => {
    modulo = require(ruta);
  });
  return modulo;
}

function definirObligatorias() {
  Object.assign(process.env, { DB_HOST: 'base.ejemplo', DB_USER: 'portal', DB_NAME: 'portal_proyectos' });
}

describe('configuración para la nube', () => {
  test('sin DB_SSL ni DB_TIMEZONE, la conexión queda como en Docker', () => {
    const config = cargar('../src/config/env');
    expect(config.db.ssl).toBeUndefined();
    expect(config.zonaHorariaDb).toBeNull();
    expect(config.archivos.enNube).toBe(false);
  });

  test('con DB_SSL la conexión se cifra y revisa el certificado del proveedor', () => {
    process.env.DB_SSL = 'true';
    process.env.DB_SSL_CA = '-----BEGIN CERTIFICATE-----\\nABC\\n-----END CERTIFICATE-----';

    const { db } = cargar('../src/config/env');

    expect(db.ssl).toEqual({
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
      ca: '-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----',
    });
  });

  test('en Vercel, sin UPLOADS_DIR, los archivos llegan a la carpeta temporal', () => {
    delete process.env.UPLOADS_DIR;
    process.env.VERCEL = '1';

    const { archivos } = cargar('../src/config/env');

    expect(archivos.carpeta.startsWith(os.tmpdir())).toBe(true);
  });

  test('ENV_FILE lee otro archivo, por ejemplo el de la base del despliegue', () => {
    const archivo = path.join(os.tmpdir(), `env-nube-${process.pid}`);
    fs.writeFileSync(archivo, 'DB_TIMEZONE=-06:00\n');
    process.env.ENV_FILE = archivo;
    delete process.env.DB_TIMEZONE;

    try {
      expect(cargar('../src/config/env').zonaHorariaDb).toBe('-06:00');
    } finally {
      fs.unlinkSync(archivo);
    }
  });
});

describe('zona horaria de la base', () => {
  function baseFalsa() {
    const eventos = {};
    const conjunto = { pool: { on: jest.fn((nombre, oyente) => { eventos[nombre] = oyente; }) }, execute: jest.fn(async () => [[]]) };
    jest.doMock('mysql2/promise', () => ({ createPool: jest.fn(() => conjunto) }));
    return { conjunto, eventos };
  }

  test('con DB_TIMEZONE, cada conexión nueva usa la hora de México', async () => {
    process.env.DB_TIMEZONE = '-06:00';
    const { eventos } = baseFalsa();
    const db = cargar('../src/config/db');

    await db.consultar('SELECT 1');
    const conexion = { query: jest.fn() };
    eventos.connection(conexion);

    expect(conexion.query).toHaveBeenCalledWith('SET time_zone = ?', ['-06:00'], expect.any(Function));
  });

  test('si no se puede fijar, lo reporta sin tumbar la API', async () => {
    process.env.DB_TIMEZONE = '-06:00';
    const { eventos } = baseFalsa();
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const db = cargar('../src/config/db');

    await db.consultar('SELECT 1');
    eventos.connection({ query: (sql, valores, listo) => listo({ code: 'ER_UNKNOWN_TIME_ZONE' }) });

    expect(error).toHaveBeenCalledWith('[db] No se pudo fijar la zona horaria: ER_UNKNOWN_TIME_ZONE');
  });

  test('sin DB_TIMEZONE no cambia nada (Docker ya trae la hora de México)', async () => {
    delete process.env.DB_TIMEZONE;
    const { conjunto } = baseFalsa();
    const db = cargar('../src/config/db');

    await db.consultar('SELECT 1');

    expect(conjunto.pool.on).not.toHaveBeenCalled();
  });
});

describe('punto de entrada en Vercel (api/index.js)', () => {
  test('con la configuración completa responde como la API local', async () => {
    definirObligatorias();
    const funcion = cargar('../api/index.js');

    const respuesta = await request(funcion).get('/api/salud');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ ok: true, servicio: 'portal-proyectos-api' });
  });

  test('si falta una variable, responde 503 y solo dice su nombre, nunca un valor', async () => {
    definirObligatorias();
    delete process.env.DB_HOST;
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const funcion = cargar('../api/index.js');

    const respuesta = await request(funcion).get('/api/salud');

    expect(respuesta.status).toBe(503);
    expect(respuesta.body.error).toBe('La API no está configurada todavía.');
    expect(error).toHaveBeenCalledWith('Faltan variables de entorno en Vercel: DB_HOST.');
    expect(JSON.stringify(error.mock.calls)).not.toContain(process.env.JWT_SECRET);
  });
});

describe('correos de aviso en Vercel', () => {
  test('la función sigue viva hasta que salen los correos', async () => {
    const waitUntil = jest.fn();
    jest.doMock('@vercel/functions', () => ({ waitUntil }));
    jest.doMock('../src/utils/correo', () => ({ enviar: jest.fn().mockResolvedValue(true) }));
    const notificaciones = cargar('../src/services/notificaciones.service');

    const envio = notificaciones.enviarCorreos(
      [{ nombre: 'Ana', correo: 'ana@roble.test' }],
      { nombre: 'Ventanas' },
      { tipo: 'avance', descripcion: 'Listo', responsable: 'Arq.' },
    );

    expect(waitUntil).toHaveBeenCalledWith(envio);
    await expect(envio).resolves.toEqual([true]);
  });
});
