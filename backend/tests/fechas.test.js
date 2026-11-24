const { formatearFecha } = require('../src/utils/fechas');

describe('formatearFecha', () => {
  test('escribe la fecha en español', () => {
    expect(formatearFecha('2026-11-23')).toBe('23 de noviembre de 2026');
  });

  test('acepta la fecha con hora que entrega MySQL y quita el cero del día', () => {
    expect(formatearFecha('2026-01-05 10:30:00')).toBe('5 de enero de 2026');
  });

  test('devuelve null cuando la fecha no es válida', () => {
    expect(formatearFecha('2026-13-01')).toBeNull();
    expect(formatearFecha('ayer')).toBeNull();
    expect(formatearFecha(undefined)).toBeNull();
  });
});
