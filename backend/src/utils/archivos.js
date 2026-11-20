// Recepción de fotos y documentos. Se guardan en la carpeta de archivos del servidor
// (contenedor «Archivos» de docs/CONTAINERS.md), con un nombre aleatorio.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const config = require('../config/env');
const { solicitudInvalida } = require('./errores');

const TIPOS_PERMITIDOS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function subidaEn(subcarpeta, { maxArchivos = 1 } = {}) {
  const almacenamiento = multer.diskStorage({
    destination(req, archivo, listo) {
      const destino = path.join(config.archivos.carpeta, subcarpeta);
      fs.mkdir(destino, { recursive: true }, (error) => listo(error, destino));
    },
    filename(req, archivo, listo) {
      listo(null, `${crypto.randomUUID()}${TIPOS_PERMITIDOS[archivo.mimetype]}`);
    },
  });

  return multer({
    storage: almacenamiento,
    limits: { fileSize: config.archivos.tamanoMaximoMb * 1024 * 1024, files: maxArchivos },
    fileFilter(req, archivo, listo) {
      if (TIPOS_PERMITIDOS[archivo.mimetype]) return listo(null, true);
      return listo(solicitudInvalida('Solo se aceptan imágenes JPG, PNG o WEBP y archivos PDF.'));
    },
  });
}

// Ruta relativa que se guarda en la base de datos, por ejemplo "documentos/abc.pdf".
const rutaRelativa = (subcarpeta, archivo) => path.posix.join(subcarpeta, archivo.filename);

const rutaAbsoluta = (relativa) => path.join(config.archivos.carpeta, relativa);

// Borra archivos recibidos cuando la petición falla, para no dejar basura.
async function borrarArchivos(archivos = []) {
  await Promise.all(archivos.map((archivo) => fs.promises.unlink(archivo.path).catch(() => {})));
}

module.exports = { subidaEn, rutaRelativa, rutaAbsoluta, borrarArchivos, TIPOS_PERMITIDOS };
