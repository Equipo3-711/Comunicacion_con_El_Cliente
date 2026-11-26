// Punto de entrada en Vercel: la misma app que abre server.js en local, como una función.
// vercel.json manda aquí todas las rutas; la app ya responde en /api/...
const config = require('../src/config/env');
const { crearApp } = require('../src/app');

function appSinConfigurar(faltantes) {
  // Solo los NOMBRES de las variables, nunca sus valores (AGENTS.md).
  console.error(`Faltan variables de entorno en Vercel: ${faltantes.join(', ')}.`);
  return (req, res) => {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'La API no está configurada todavía.' }));
  };
}

const faltantes = config.variablesFaltantes();
module.exports = faltantes.length > 0 ? appSinConfigurar(faltantes) : crearApp();
