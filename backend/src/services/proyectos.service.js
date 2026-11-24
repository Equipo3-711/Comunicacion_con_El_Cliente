const db = require('../config/db');
const proyectos = require('../repositories/proyectos.repository');
const empresas = require('../repositories/empresas.repository');
const actualizaciones = require('../repositories/actualizaciones.repository');
const cotizaciones = require('../repositories/cotizaciones.repository');
const solicitudes = require('../repositories/solicitudes.repository');
const notificaciones = require('./notificaciones.service');
const { ESTADOS } = require('../validators/proyecto.validator');
const { noEncontrado, solicitudInvalida, conflicto } = require('../utils/errores');

// Busca el proyecto y comprueba que el usuario pueda verlo.
// A un cliente de otra empresa se le responde "no existe", para no revelar proyectos ajenos (RNF-06).
async function verificarAcceso(usuario, proyectoId, conexion) {
  const id = Number(proyectoId);
  const proyecto = Number.isInteger(id) && id > 0 ? await proyectos.buscarPorId(id, conexion) : null;
  if (!proyecto || (usuario.rol === 'cliente' && proyecto.empresaId !== usuario.empresaId)) {
    throw noEncontrado('El proyecto no existe.');
  }
  return proyecto;
}

// El cliente nunca recibe la información privada de la empresa (T-06).
function paraUsuario(proyecto, usuario) {
  if (usuario.rol === 'admin') return proyecto;
  const { notasInternas, ...visible } = proyecto;
  return visible;
}

async function listar(usuario) {
  return usuario.rol === 'admin' ? proyectos.listarTodos() : proyectos.listarDeEmpresa(usuario.empresaId);
}

async function obtener(usuario, proyectoId) {
  return paraUsuario(await verificarAcceso(usuario, proyectoId), usuario);
}

const eventoApertura = (admin) => ({
  tipo: 'cambio_estado', descripcion: `Se abrió el proyecto en estado «${ESTADOS.cotizacion}».`, responsable: admin.nombre,
});

// Guarda el proyecto con su primer evento del historial y avisa a los clientes de la empresa.
// Se llama dentro de una transacción; también la usa el alta de clientes.
async function abrir(admin, datos, conexion) {
  const evento = eventoApertura(admin);
  const id = await proyectos.crear({ ...datos, responsableId: admin.id }, conexion);
  await actualizaciones.crear({ proyectoId: id, tipo: evento.tipo, descripcion: evento.descripcion, responsableId: admin.id }, conexion);
  const proyecto = { id, ...datos, estado: 'cotizacion', atencion: 'atendido', responsableId: admin.id };
  const clientes = await notificaciones.avisarClientes(proyecto, { descripcion: evento.descripcion }, conexion);
  return { proyecto, clientes, evento };
}

// La cotización tiene que ser de un cliente de la misma empresa y no tener ya un proyecto.
async function verificarCotizacion(cotizacionId, empresaId, conexion) {
  const cotizacion = await cotizaciones.buscarPorId(cotizacionId, conexion);
  if (!cotizacion) throw solicitudInvalida('Revisa los campos marcados.', { cotizacionId: 'La cotización no existe.' });
  if (cotizacion.proyectoId) throw conflicto(`Esa cotización ya tiene el proyecto #${cotizacion.proyectoId}.`);
  if (cotizacion.empresaId !== empresaId) {
    throw solicitudInvalida('Revisa los campos marcados.', { empresaId: 'Elige la empresa del cliente que pidió la cotización.' });
  }
  return cotizacion;
}

async function crear(admin, { cotizacionId, ...datos }) {
  if (!(await empresas.buscarPorId(datos.empresaId))) {
    throw solicitudInvalida('Revisa los campos marcados.', { empresaId: 'La empresa no existe.' });
  }
  const { proyecto, clientes, evento } = await db.transaccion(async (conexion) => {
    const cotizacion = cotizacionId ? await verificarCotizacion(cotizacionId, datos.empresaId, conexion) : null;
    const abierto = await abrir(admin, datos, conexion);
    if (cotizacion) {
      await cotizaciones.ligarProyecto(cotizacion.id, abierto.proyecto.id, conexion);
      await solicitudes.ligarProyectoPorCotizacion(cotizacion.id, abierto.proyecto.id, conexion);
    }
    return abierto;
  });
  notificaciones.enviarCorreos(clientes, proyecto, evento);
  return cotizacionId ? { ...proyecto, cotizacionId } : proyecto;
}

async function cambiarEstado(admin, proyectoId, estado) {
  const evento = { tipo: 'cambio_estado', descripcion: `El proyecto pasó a «${ESTADOS[estado]}».`, responsable: admin.nombre };

  const { proyecto, clientes } = await db.transaccion(async (conexion) => {
    const actual = await verificarAcceso(admin, proyectoId, conexion);
    if (actual.estado === estado) throw solicitudInvalida(`El proyecto ya está «${ESTADOS[estado]}».`);
    await proyectos.actualizarEstado(actual.id, estado, conexion);
    await actualizaciones.crear({ proyectoId: actual.id, tipo: evento.tipo, descripcion: evento.descripcion, responsableId: admin.id }, conexion);
    const avisados = await notificaciones.avisarClientes(actual, { descripcion: evento.descripcion }, conexion);
    return { proyecto: { ...actual, estado }, clientes: avisados };
  });

  notificaciones.enviarCorreos(clientes, proyecto, evento);
  return proyecto;
}

// El arquitecto cambia a mano el semáforo de atención del proyecto.
async function cambiarAtencion(admin, proyectoId, atencion) {
  const proyecto = await verificarAcceso(admin, proyectoId);
  await proyectos.actualizarAtencion(proyecto.id, atencion);
  return { ...proyecto, atencion };
}

async function actualizarDatos(admin, proyectoId, cambios) {
  const proyecto = await verificarAcceso(admin, proyectoId);
  await proyectos.actualizarDatos(proyecto.id, cambios);
  return { ...proyecto, ...cambios };
}

// Cada evento del historial lleva los ids de sus fotos, que se ven en /api/fotos/:id/ver.
async function historial(usuario, proyectoId) {
  const proyecto = await verificarAcceso(usuario, proyectoId);
  const [eventos, fotos] = await Promise.all([
    actualizaciones.listarPorProyecto(proyecto.id),
    actualizaciones.listarFotosPorProyecto(proyecto.id),
  ]);
  return eventos.map((evento) => ({
    ...evento,
    fotos: (fotos || []).filter((foto) => foto.actualizacionId === evento.id).map((foto) => foto.id),
  }));
}

module.exports = {
  verificarAcceso, listar, obtener, abrir, crear, cambiarEstado, cambiarAtencion, actualizarDatos, historial,
};
