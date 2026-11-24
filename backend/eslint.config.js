// Reglas del linter (docs/PRUEBAS.md). Complejidad máxima acordada: 10.
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['coverage/', 'uploads/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      complexity: ['error', 10],
    },
  },
];
