import { describe, expect, test } from 'vitest';
import { dinero, fechaCorta, hora, hoy, iniciales, mesYAnio, soloFecha } from './formatos';
import { destinoDe } from './destinos';
import { nombreConEmpresa } from './textos';
import type { Pendiente } from '../tipos';

describe('formatos', () => {
  test('fechas como las entrega la API', () => {
    expect(fechaCorta('2026-11-08 10:30:00')).toBe('08 nov');
    expect(hora('2026-11-08 10:30:00')).toBe('10:30');
    expect(mesYAnio('2027-03-01')).toBe('marzo 2027');
    expect(soloFecha('2027-03-01 00:00:00')).toBe('2027-03-01');
    expect(hoy(new Date(2026, 0, 5))).toBe('05 ene');
    expect(fechaCorta(null)).toBe('');
  });

  test('dinero sin decimales y «Por definir» si no hay cantidad', () => {
    expect(dinero(185000)).toBe('$185,000 MXN');
    expect(dinero('42500.00')).toBe('$42,500 MXN');
    expect(dinero(null)).toBe('Por definir');
  });

  test('iniciales sin el título profesional', () => {
    expect(iniciales('Arq. Laura Méndez')).toBe('LM');
    expect(iniciales('Constructora')).toBe('C');
    expect(iniciales(null)).toBe('?');
  });

  test('nombre con empresa solo si son distintos', () => {
    expect(nombreConEmpresa('Ana López', 'Constructora Roble')).toBe('Ana López · Constructora Roble');
    expect(nombreConEmpresa('Ana López', 'Ana López')).toBe('Ana López');
    expect(nombreConEmpresa('Ana López', null)).toBe('Ana López');
  });
});

describe('a dónde lleva cada pendiente de la campana', () => {
  const pendiente = (tipo: Pendiente['tipo'], proyectoId: number | null = 7): Pendiente => ({
    id: 1, tipo, descripcion: '', proyectoId, creadoEn: '2026-11-08 10:30:00',
  });

  test('cliente', () => {
    const cliente = { rol: 'cliente' as const };
    expect(destinoDe(pendiente('mensaje'), cliente)).toBe('/cliente/proyectos/7/chat');
    expect(destinoDe(pendiente('actualizacion'), cliente)).toBe('/cliente/proyectos/7');
    expect(destinoDe(pendiente('cotizacion', null), cliente)).toBe('/cliente#cotizaciones');
    expect(destinoDe(pendiente('actualizacion', null), cliente)).toBe('/cliente');
  });

  test('personal', () => {
    const admin = { rol: 'admin' as const };
    expect(destinoDe(pendiente('solicitud', null), admin)).toBe('/arquitecto/solicitudes');
    expect(destinoDe(pendiente('mensaje'), admin)).toBe('/arquitecto/proyectos/7/chat');
    expect(destinoDe(pendiente('cotizacion', null), admin)).toBe('/arquitecto#cotizaciones');
  });
});
