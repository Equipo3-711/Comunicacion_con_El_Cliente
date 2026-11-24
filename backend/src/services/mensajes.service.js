// Chat del proyecto: solo para dudas. El seguimiento va en el historial (CC-04).
const db = require('../config/db');
const mensajes = require('../repositories/mensajes.repository');
const proyectos = require('../repositories/proyectos.repository');
const notificaciones = require('./notificaciones.service');
const { verificarAcceso } = require('./proyectos.service');

async function listar(usuario, proyectoId) {
  const proyecto = await verificarAcceso(usuario, proyectoId);
  return mensajes.listarPorProyecto(proyecto.id);
}

// Semáforo del chat: una duda nueva del cliente queda «No atendido»;
// cuando el arquitecto responde, pasa a «Pendiente» hasta que él la marque como atendida.
function atencionDespuesDe(usuario, actual) {
  if (usuario.rol === 'cliente') return 'no_atendido';
  return actual === 'no_atendido' ? 'pendiente' : actual;
}

// Guarda el mensaje, lo deja pendiente en la campana de la otra parte y actualiza el semáforo.
async function enviar(usuario, proyectoId, texto) {
  return db.transaccion(async (conexion) => {
    const proyecto = await verificarAcceso(usuario, proyectoId, conexion);
    const id = await mensajes.crear({ proyectoId: proyecto.id, autorId: usuario.id, texto }, conexion);

    if (usuario.rol === 'cliente') {
      await notificaciones.avisarUsuario(proyecto.responsableId, proyecto, { tipo: 'mensaje', descripcion: `Nueva duda de ${usuario.nombre}` }, conexion);
    } else {
      await notificaciones.avisarClientes(proyecto, { tipo: 'mensaje', descripcion: `${usuario.nombre} respondió tu duda` }, conexion);
    }

    const atencion = atencionDespuesDe(usuario, proyecto.atencion);
    if (atencion !== proyecto.atencion) await proyectos.actualizarAtencion(proyecto.id, atencion, conexion);

    return { id, proyectoId: proyecto.id, texto, autorId: usuario.id, autor: usuario.nombre, rolAutor: usuario.rol };
  });
}

module.exports = { listar, enviar };
