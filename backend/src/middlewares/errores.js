const multer = require('multer');
const { ErrorHttp } = require('../utils/errores');
const config = require('../config/env');

function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: 'La ruta no existe.' });
}

// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  if (err instanceof ErrorHttp) {
    const cuerpo = { error: err.message };
    if (err.detalles) cuerpo.detalles = err.detalles;
    return res.status(err.estado).json(cuerpo);
  }

  if (err instanceof multer.MulterError) {
    const mensaje = err.code === 'LIMIT_FILE_SIZE'
      ? `Cada archivo puede pesar como máximo ${config.archivos.tamanoMaximoMb} MB.`
      : 'No se pudo recibir el archivo. Revisa cuántos archivos envías y su tipo.';
    return res.status(400).json({ error: mensaje });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }

  // Solo se registra el código y el mensaje, nunca la configuración ni los datos enviados.
  console.error(`[error] ${err.code || 'SIN_CODIGO'}: ${err.message}`);
  return res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo en unos minutos.' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
