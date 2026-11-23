const db = require('../config/db');
const proyectos = require('../repositories/proyectos.repository');
const empresas = require('../repositories/empresas.repository');
const actualizaciones = require('../repositories/actualizaciones.repository');
const notificaciones = require('./notificaciones.service');
const { ESTADOS } = require('../validators/proyecto.validator');
const { noEncontrado, solicitudInvalida } = require('../utils/errores');

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

async function crear(admin, datos) {
  if (!(await empresas.buscarPorId(datos.empresaId))) {
    throw solicitudInvalida('Revisa los campos marcados.', { empresaId: 'La empresa no existe.' });
  }
  const evento = { tipo: 'cambio_estado', descripcion: `Se abrió el proyecto en estado «${ESTADOS.cotizacion}».`, responsable: admin.nombre };

  const { proyecto, clientes } = await db.transaccion(async (conexion) => {
    const id = await proyectos.crear({ ...datos, responsableId: admin.id }, conexion);
    await actualizaciones.crear({ proyectoId: id, tipo: evento.tipo, descripcion: evento.descripcion, responsableId: admin.id }, conexion);
    const nuevo = { id, ...datos, estado: 'cotizacion', responsableId: admin.id };
    const avisados = await notificaciones.avisarClientes(nuevo, { descripcion: evento.descripcion }, conexion);
    return { proyecto: nuevo, clientes: avisados };
  });

  notificaciones.enviarCorreos(clientes, proyecto, evento);
  return proyecto;
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

async function actualizarDatos(admin, proyectoId, cambios) {
  const proyecto = await verificarAcceso(admin, proyectoId);
  await proyectos.actualizarDatos(proyecto.id, cambios);
  return { ...proyecto, ...cambios };
}

async function historial(usuario, proyectoId) {
  const proyecto = await verificarAcceso(usuario, proyectoId);
  return actualizaciones.listarPorProyecto(proyecto.id);
}

module.exports = { verificarAcceso, listar, obtener, crear, cambiarEstado, actualizarDatos, historial };
