// Seguimiento del proyecto sin conversación: actualizaciones estructuradas (RF-16, CC-04)
// y actividades que se marcan como realizadas y le aparecen al cliente (RF-17, CC-07).
const db = require('../config/db');
const actualizaciones = require('../repositories/actualizaciones.repository');
const actividades = require('../repositories/actividades.repository');
const notificaciones = require('./notificaciones.service');
const { verificarAcceso } = require('./proyectos.service');
const { rutaRelativa } = require('../utils/archivos');
const almacen = require('../utils/almacen');
const { noEncontrado, conflicto, solicitudInvalida } = require('../utils/errores');

const esImagen = (archivo) => archivo.mimetype.startsWith('image/');

// Guarda el evento en el historial y avisa a los clientes. Se llama dentro de una transacción.
async function publicar(admin, proyecto, { tipo, descripcion }, conexion) {
  const id = await actualizaciones.crear({ proyectoId: proyecto.id, tipo, descripcion, responsableId: admin.id }, conexion);
  const clientes = await notificaciones.avisarClientes(proyecto, { descripcion }, conexion);
  return { actualizacion: { id, proyectoId: proyecto.id, tipo, descripcion, responsable: admin.nombre }, clientes };
}

// Las fotos son opcionales (RF-07). Solo se aceptan imágenes: los PDF van en Documentos.
async function registrarActualizacion(admin, proyectoId, datos, fotos = []) {
  if (!fotos.every(esImagen)) throw solicitudInvalida('Las fotos deben ser imágenes JPG, PNG o WEBP.');

  const { proyecto, actualizacion, clientes } = await db.transaccion(async (conexion) => {
    const encontrado = await verificarAcceso(admin, proyectoId, conexion);
    const publicado = await publicar(admin, encontrado, datos, conexion);
    for (const foto of fotos) {
      await actualizaciones.agregarFoto(
        { actualizacionId: publicado.actualizacion.id, ruta: rutaRelativa('fotos', foto), tipoMime: foto.mimetype },
        conexion,
      );
    }
    return { proyecto: encontrado, ...publicado };
  });
  notificaciones.enviarCorreos(clientes, proyecto, actualizacion);
  return { ...actualizacion, fotos: fotos.length };
}

// Devuelve dónde está la foto, solo si el usuario puede ver ese proyecto.
async function obtenerFotoParaVer(usuario, fotoId) {
  const id = Number(fotoId);
  const foto = Number.isInteger(id) && id > 0 ? await actualizaciones.buscarFoto(id) : null;
  if (!foto) throw noEncontrado('La foto no existe.');
  await verificarAcceso(usuario, foto.proyectoId);
  const guardado = await almacen.abrir(foto.ruta);
  if (!guardado) throw noEncontrado('El archivo de la foto ya no está disponible.');
  return { ...foto, guardado };
}

async function listarActividades(usuario, proyectoId) {
  const proyecto = await verificarAcceso(usuario, proyectoId);
  return actividades.listarPorProyecto(proyecto.id);
}

async function crearActividad(admin, proyectoId, { descripcion }) {
  const proyecto = await verificarAcceso(admin, proyectoId);
  const id = await actividades.crear({ proyectoId: proyecto.id, descripcion });
  return { id, proyectoId: proyecto.id, descripcion, realizada: false };
}

// Un solo paso del arquitecto: la actividad queda realizada y el cliente la ve en su historial.
async function marcarRealizada(admin, actividadId) {
  const id = Number(actividadId);
  const { proyecto, actualizacion, clientes } = await db.transaccion(async (conexion) => {
    const actividad = Number.isInteger(id) && id > 0 ? await actividades.buscarPorId(id, conexion) : null;
    if (!actividad) throw noEncontrado('La actividad no existe.');
    const encontrado = await verificarAcceso(admin, actividad.proyectoId, conexion);
    if (actividad.realizada || (await actividades.marcarRealizada(id, admin.id, conexion)) === 0) {
      throw conflicto('Esta actividad ya está marcada como realizada.');
    }
    const publicado = await publicar(admin, encontrado, { tipo: 'avance', descripcion: `Se terminó: ${actividad.descripcion}.` }, conexion);
    return { proyecto: encontrado, ...publicado };
  });
  notificaciones.enviarCorreos(clientes, proyecto, actualizacion);
  return actualizacion;
}

module.exports = {
  publicar, registrarActualizacion, obtenerFotoParaVer, listarActividades, crearActividad, marcarRealizada,
};
