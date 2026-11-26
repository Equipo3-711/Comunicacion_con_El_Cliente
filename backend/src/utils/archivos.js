// Recepción de fotos y documentos. Llegan a la carpeta de archivos del servidor con un nombre
// aleatorio y, ya revisados, quedan donde diga utils/almacen.js (la carpeta o Vercel Blob).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const config = require('../config/env');
const almacen = require('./almacen');
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
    // Los navegadores mandan el nombre del archivo en UTF-8; sin esto, «plano baño.pdf» llega como «plano baÃ±o.pdf».
    defParamCharset: 'utf8',
    limits: { fileSize: config.archivos.tamanoMaximoMb * 1024 * 1024, files: maxArchivos },
    fileFilter(req, archivo, listo) {
      if (TIPOS_PERMITIDOS[archivo.mimetype]) return listo(null, true);
      return listo(solicitudInvalida('Solo se aceptan imágenes JPG, PNG o WEBP y archivos PDF.'));
    },
  });
}

// Ruta relativa que se guarda en la base de datos, por ejemplo "documentos/abc.pdf".
const rutaRelativa = (subcarpeta, archivo) => path.posix.join(subcarpeta, archivo.filename);

// Borra archivos recibidos cuando la petición falla, para no dejar basura.
async function borrarArchivos(archivos = []) {
  await almacen.borrarSubidos(archivos);
}

// Primeros bytes («firma») de cada tipo permitido. El tipo que manda el navegador
// se puede falsificar; el contenido del archivo no (OWASP File Upload Cheat Sheet).
const FIRMAS = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],
};

// Revisa que el contenido corresponda al tipo declarado.
function coincideFirma(tipo, inicio) {
  if (tipo === 'image/webp') {
    return inicio.toString('latin1', 0, 4) === 'RIFF' && inicio.toString('latin1', 8, 12) === 'WEBP';
  }
  const firma = FIRMAS[tipo];
  return Boolean(firma) && firma.every((byte, posicion) => inicio[posicion] === byte);
}

async function leerInicio(ruta) {
  const archivo = await fs.promises.open(ruta, 'r');
  try {
    const { buffer, bytesRead } = await archivo.read(Buffer.alloc(12), 0, 12, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await archivo.close();
  }
}

// Va después de multer: si algún archivo no es lo que dice ser, borra todos y responde 400.
// Si todos están bien, los deja guardados donde corresponde.
async function verificarContenido(req, res, siguiente) {
  const archivos = req.file ? [req.file] : req.files || [];
  for (const archivo of archivos) {
    if (!coincideFirma(archivo.mimetype, await leerInicio(archivo.path))) {
      await borrarArchivos(archivos);
      throw solicitudInvalida('El archivo no es una imagen JPG, PNG o WEBP ni un PDF válido.');
    }
  }
  try {
    await almacen.guardarSubidos(archivos);
  } catch (error) {
    await borrarArchivos(archivos);
    throw error;
  }
  siguiente();
}

module.exports = {
  subidaEn, rutaRelativa, borrarArchivos, coincideFirma, verificarContenido, TIPOS_PERMITIDOS,
};
