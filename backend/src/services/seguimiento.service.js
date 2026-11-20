// Seguimiento del proyecto sin conversación: actualizaciones estructuradas (RF-16, CC-04)
// y actividades que se marcan como realizadas y le aparecen al cliente (RF-17, CC-07).
const db = require('../config/db');
const actualizaciones = require('../repositories/actualizaciones.repository');
const actividades = require('../repositories/actividades.repository');
const notificaciones = require('./notificaciones.service');
const { verificarAcceso } = require('./proyectos.service');
const { noEncontrado, conflicto } = require('../utils/errores');

// Guarda el evento en el historial y avisa a los clientes. Se llama dentro de una transacción.
async function publicar(admin, proyecto, { tipo, descripcion }, conexion) {
  const id = await actualizaciones.crear({ proyectoId: proyecto.id, tipo, descripcion, responsableId: admin.id }, conexion);
  const clientes = await notificaciones.avisarClientes(proyecto, { descripcion }, conexion);
  return { actualizacion: { id, proyectoId: proyecto.id, tipo, descripcion, responsable: admin.nombre }, clientes };
}

async function registrarActualizacion(admin, proyectoId, datos) {
  const { proyecto, actualizacion, clientes } = await db.transaccion(async (conexion) => {
    const encontrado = await verificarAcceso(admin, proyectoId, conexion);
    return { proyecto: encontrado, ...(await publicar(admin, encontrado, datos, conexion)) };
  });
  notificaciones.enviarCorreos(clientes, proyecto, actualizacion);
  return actualizacion;
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

module.exports = { registrarActualizacion, listarActividades, crearActividad, marcarRealizada };
