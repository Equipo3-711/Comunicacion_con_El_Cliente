// Seguimiento automático del proyecto (CC-05): el resumen de cómo va la obra, armado con sus datos.
jest.mock('../src/config/db', () => ({ consultar: jest.fn(), transaccion: jest.fn((trabajo) => trabajo('cx')) }));
jest.mock('../src/repositories/proyectos.repository');
jest.mock('../src/repositories/actividades.repository');
jest.mock('../src/repositories/actualizaciones.repository');

const request = require('supertest');
const { crearApp } = require('../src/app');
const proyectos = require('../src/repositories/proyectos.repository');
const actividades = require('../src/repositories/actividades.repository');
const actualizaciones = require('../src/repositories/actualizaciones.repository');
const { armarResumen } = require('../src/services/resumen.service');
const { bearer, ADMIN, CLIENTE, OTRO_CLIENTE } = require('./ayudas');

const app = crearApp();

// Mediodía en México, para que el día no cambie por la zona horaria.
const HOY = new Date('2026-11-27T18:00:00Z');
const PROYECTO = {
  id: 7, nombre: 'Ventanas · Blvd. Campestre 214', estado: 'en_instalacion', empresaId: CLIENTE.empresaId,
  presupuesto: '120000.00', pagado: '72000.00', garantiaHasta: null, notasInternas: 'Cliente pide factura',
};
const ACTIVIDADES = [
  { id: 1, descripcion: 'Medición', realizada: true },
  { id: 2, descripcion: 'Fabricación', realizada: true },
  { id: 3, descripcion: 'Instalación de ventanas', realizada: false },
];
// Como los entrega la base: texto en hora de México.
const EVENTOS = [
  { id: 9, descripcion: 'Se instalaron 2 de 3 ventanas.', responsable: 'Arq. Laura Méndez', fecha: '2026-11-25 22:30:00' },
  { id: 8, descripcion: 'Fabricación terminada.', responsable: 'Arq. Laura Méndez', fecha: '2026-11-20 11:00:00' },
];

const armar = (cambios = {}) => armarResumen({
  proyecto: { ...PROYECTO, ...cambios.proyecto },
  actividades: cambios.actividades ?? ACTIVIDADES,
  eventos: cambios.eventos ?? EVENTOS,
  hoy: cambios.hoy ?? HOY,
});

describe('cómo se arma el resumen de la obra', () => {
  test('etapa, actividades, último movimiento y pagos, en el lenguaje del cliente', () => {
    const resumen = armar();
    expect(resumen.etapa).toEqual({ clave: 'en_instalacion', nombre: expect.any(String), numero: 3, total: 4 });
    expect(resumen.actividades).toEqual({ realizadas: 2, total: 3, porcentaje: 67, siguiente: 'Instalación de ventanas' });
    expect(resumen.ultimoMovimiento).toMatchObject({ descripcion: 'Se instalaron 2 de 3 ventanas.', dias: 2 });
    expect(resumen.pagos).toEqual({ presupuesto: 120000, pagado: 72000, porcentaje: 60, saldo: 48000 });
    expect(resumen.puntos).toEqual([
      expect.stringMatching(/etapa 3 de 4/),
      'Van 2 de 3 actividades realizadas (67 %). Lo siguiente es «Instalación de ventanas».',
      'El último movimiento fue hace 2 días: «Se instalaron 2 de 3 ventanas.», por Arq. Laura Méndez.',
      expect.stringMatching(/^Has pagado \$72,000\.00 de \$120,000\.00 \(60 %\)\.$/),
    ]);
    expect(resumen.avisos).toEqual([]);
  });

  test('sin movimientos por 7 días o más, le sugiere preguntar en el chat', () => {
    const resumen = armar({ hoy: new Date('2026-12-04T18:00:00Z') });
    expect(resumen.ultimoMovimiento.dias).toBe(9);
    expect(resumen.avisos).toEqual([expect.stringMatching(/^Lleva 9 días sin movimientos registrados/)]);
  });

  test('hoy y ayer se dicen así, contando días de México y no de UTC', () => {
    // 22:30 del 25 en México ya es 26 en UTC: sigue siendo «hoy» a las 23:00 del 25 en México.
    expect(armar({ hoy: new Date('2026-11-26T05:00:00Z') }).puntos[2]).toMatch(/fue hoy/);
    expect(armar({ hoy: new Date('2026-11-26T18:00:00Z') }).puntos[2]).toMatch(/fue ayer/);
  });

  test('la fecha de la garantía no se recorre un día', () => {
    expect(armar({ proyecto: { garantiaHasta: '2028-03-31' } }).puntos).toContain('Tu garantía está vigente hasta el 31 de marzo de 2028.');
  });

  test('con todas las actividades realizadas, avisa que falta marcarla como terminada', () => {
    const resumen = armar({ actividades: ACTIVIDADES.map((actividad) => ({ ...actividad, realizada: true })) });
    expect(resumen.puntos[1]).toBe('Van 3 de 3 actividades realizadas (100 %). Ya están todas.');
    expect(resumen.avisos).toEqual([expect.stringMatching(/falta que tu arquitecto marque la obra como terminada/)]);
  });

  test('obra terminada: garantía, saldo pendiente y sin aviso de días sin movimiento', () => {
    const resumen = armar({
      proyecto: { estado: 'terminado', garantiaHasta: '2028-03-31' },
      hoy: new Date('2027-01-30T18:00:00Z'),
    });
    expect(resumen.puntos[0]).toBe('Tu obra está terminada.');
    expect(resumen.puntos).toContain('Tu garantía está vigente hasta el 31 de marzo de 2028.');
    expect(resumen.avisos).toEqual([expect.stringMatching(/^Queda un saldo de \$48,000\.00\.$/)]);
  });

  test('proyecto recién abierto: sin actividades, sin movimientos y sin presupuesto', () => {
    const resumen = armar({ proyecto: { estado: 'cotizacion', presupuesto: null, pagado: null }, actividades: [], eventos: [] });
    expect(resumen.actividades).toEqual({ realizadas: 0, total: 0, porcentaje: 0, siguiente: null });
    expect(resumen.ultimoMovimiento).toBeNull();
    expect(resumen.pagos).toBeNull();
    expect(resumen.puntos).toEqual([expect.stringMatching(/etapa 1 de 4/), 'Todavía no hay actividades programadas.']);
  });

  test('pagado completo', () => {
    expect(armar({ proyecto: { pagado: '120000' } }).puntos[3]).toMatch(/ya está pagado completo/);
  });
});

describe('GET /api/proyectos/:id/resumen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    proyectos.buscarPorId.mockResolvedValue({ ...PROYECTO });
    actividades.listarPorProyecto.mockResolvedValue(ACTIVIDADES);
    actualizaciones.listarPorProyecto.mockResolvedValue(EVENTOS);
  });

  test('el cliente ve el resumen de su obra, sin notas internas', async () => {
    const respuesta = await request(app).get('/api/proyectos/7/resumen').set('Authorization', bearer(CLIENTE));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resumen.actividades.total).toBe(3);
    expect(respuesta.body.resumen.puntos.length).toBeGreaterThan(2);
    expect(JSON.stringify(respuesta.body)).not.toContain('factura');
  });

  test('el personal también lo ve', async () => {
    const respuesta = await request(app).get('/api/proyectos/7/resumen').set('Authorization', bearer(ADMIN));
    expect(respuesta.status).toBe(200);
  });

  test('un cliente de otra empresa recibe 404', async () => {
    const respuesta = await request(app).get('/api/proyectos/7/resumen').set('Authorization', bearer(OTRO_CLIENTE));
    expect(respuesta.status).toBe(404);
    expect(actividades.listarPorProyecto).not.toHaveBeenCalled();
  });

  test('sin sesión, 401', async () => {
    const respuesta = await request(app).get('/api/proyectos/7/resumen');
    expect(respuesta.status).toBe(401);
  });
});
