// Documentos del proyecto (RF-08, RF-10). El cliente los ve sin opción de descarga (CC-02).
const path = require('node:path');
const db = require('../config/db');
const documentos = require('../repositories/documentos.repository');
const notificaciones = require('./notificaciones.service');
const { verificarAcceso } = require('./proyectos.service');
const { publicar } = require('./seguimiento.service');
const { rutaRelativa } = require('../utils/archivos');
const almacen = require('../utils/almacen');
const { noEncontrado, solicitudInvalida } = require('../utils/errores');

async function listar(usuario, proyectoId) {
  const proyecto = await verificarAcceso(usuario, proyectoId);
  return documentos.listarPorProyecto(proyecto.id);
}

async function subir(admin, proyectoId, archivo, nombre) {
  if (!archivo) throw solicitudInvalida('Adjunta el documento en el campo "archivo".');
  const nombreVisible = (nombre || path.parse(archivo.originalname).name).trim().slice(0, 150);

  const { proyecto, documento, actualizacion, clientes } = await db.transaccion(async (conexion) => {
    const encontrado = await verificarAcceso(admin, proyectoId, conexion);
    const id = await documentos.crear(
      { proyectoId: encontrado.id, nombre: nombreVisible, ruta: rutaRelativa('documentos', archivo), tipoMime: archivo.mimetype, subidoPor: admin.id },
      conexion,
    );
    const publicado = await publicar(admin, encontrado, { tipo: 'documento', descripcion: `Se agregó el documento «${nombreVisible}».` }, conexion);
    return { proyecto: encontrado, documento: { id, proyectoId: encontrado.id, nombre: nombreVisible, tipoMime: archivo.mimetype }, ...publicado };
  });

  notificaciones.enviarCorreos(clientes, proyecto, actualizacion);
  return documento;
}

// Devuelve dónde está el archivo, solo si el usuario puede ver ese proyecto.
async function obtenerParaVer(usuario, documentoId) {
  const id = Number(documentoId);
  const documento = Number.isInteger(id) && id > 0 ? await documentos.buscarPorId(id) : null;
  if (!documento) throw noEncontrado('El documento no existe.');
  await verificarAcceso(usuario, documento.proyectoId);
  const guardado = await almacen.abrir(documento.ruta);
  if (!guardado) throw noEncontrado('El archivo del documento ya no está disponible.');
  return { ...documento, guardado };
}

module.exports = { listar, subir, obtenerParaVer };
