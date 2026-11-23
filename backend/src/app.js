// Arma la aplicación Express. No abre el puerto: eso lo hace server.js,
// para que las pruebas puedan usar la app sin levantar el servidor.
const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const rutas = require('./routes');
const { manejarErrores, rutaNoEncontrada } = require('./middlewares/errores');

function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.origenesWeb }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', rutas);

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}

module.exports = { crearApp };
