// La configuración nunca debe mostrar el valor de una variable secreta (AGENTS.md, Seguridad).
const config = require('../src/config/env');

const OBLIGATORIAS = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const respaldo = { ...process.env };

afterEach(() => {
  process.env = { ...respaldo };
});

function definirTodas() {
  for (const nombre of OBLIGATORIAS) process.env[nombre] = `valor-de-ejemplo-${nombre}`;
}

describe('variables de entorno obligatorias', () => {
  test('no reporta nada cuando están todas', () => {
    definirTodas();
    expect(config.variablesFaltantes()).toEqual([]);
  });

  test('dice qué variable falta solo por su nombre, sin mostrar ningún valor', () => {
    definirTodas();
    delete process.env.DB_HOST;

    const faltantes = config.variablesFaltantes();

    expect(faltantes).toEqual(['DB_HOST']);
    expect(JSON.stringify(faltantes)).not.toContain('valor-de-ejemplo');
  });
});
