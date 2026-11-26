// Dónde quedan fotos y documentos (contenedor «Archivos» de docs/CONTAINERS.md).
// En local: la carpeta del servidor, como siempre. En Vercel, donde el disco se borra,
// pasan a Vercel Blob como archivos privados: solo la API los lee, nunca el navegador.
// En la base se guarda la misma ruta relativa en los dos casos, por ejemplo "documentos/abc.pdf".
const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');
const config = require('../config/env');

const ACCESO = { access: 'private' };

const nube = () => require('@vercel/blob');
const rutaAbsoluta = (relativa) => path.join(config.archivos.carpeta, relativa);

// "documentos/abc.pdf" a partir del archivo que multer dejó en la carpeta.
const relativaDe = (archivo) => path.relative(config.archivos.carpeta, archivo.path).split(path.sep).join('/');

// Se llama cuando el contenido ya se revisó. En la nube sube cada archivo y borra la copia temporal.
async function guardarSubidos(archivos) {
  if (!config.archivos.enNube) return;
  for (const archivo of archivos) {
    await guardar(relativaDe(archivo), archivo.path, archivo.mimetype);
  }
}

async function guardar(relativa, rutaLocal, tipoMime) {
  if (!config.archivos.enNube) return;
  const contenido = await fs.promises.readFile(rutaLocal);
  await nube().put(relativa, contenido, { ...ACCESO, contentType: tipoMime, addRandomSuffix: false });
  await fs.promises.unlink(rutaLocal).catch(() => {});
}

// Borra lo que se recibió en una petición que falló, para no dejar basura. Nunca lanza error.
async function borrarSubidos(archivos) {
  await Promise.all(archivos.map((archivo) => fs.promises.unlink(archivo.path).catch(() => {})));
  if (config.archivos.enNube && archivos.length > 0) {
    await nube().del(archivos.map(relativaDe)).catch(() => {});
  }
}

// Devuelve null si el archivo ya no existe; si existe, algo con qué mandarlo en la respuesta.
async function abrir(relativa) {
  if (!config.archivos.enNube) {
    const ruta = rutaAbsoluta(relativa);
    return fs.existsSync(ruta) ? { enviar: (res) => res.sendFile(ruta) } : null;
  }
  const encontrado = await nube().get(relativa, { ...ACCESO, useCache: false });
  if (!encontrado || encontrado.statusCode !== 200) return null;
  return { enviar: (res) => Readable.fromWeb(encontrado.stream).pipe(res) };
}

module.exports = { guardarSubidos, guardar, borrarSubidos, abrir };
