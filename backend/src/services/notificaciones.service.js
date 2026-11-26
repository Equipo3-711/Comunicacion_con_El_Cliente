// Avisos al cliente: un pendiente en su campana (RF-18) y un correo con el resumen (RF-19).
const { waitUntil } = require('@vercel/functions');
const config = require('../config/env');
const usuarios = require('../repositories/usuarios.repository');
const pendientes = require('../repositories/pendientes.repository');
const correo = require('../utils/correo');

const NOMBRES_TIPO = {
  avance: 'Avance',
  cambio_estado: 'Cambio de estado',
  documento: 'Documento',
  solicitud: 'Solicitud',
};

// Se llama dentro de la transacción. Devuelve los clientes avisados, para mandarles el correo después.
async function avisarClientes(proyecto, { tipo = 'actualizacion', descripcion }, conexion) {
  const clientes = await usuarios.listarClientesDeEmpresa(proyecto.empresaId, conexion);
  for (const cliente of clientes) {
    await pendientes.crear(
      { usuarioId: cliente.id, tipo, descripcion: `${proyecto.nombre}: ${descripcion}`, proyectoId: proyecto.id },
      conexion,
    );
  }
  return clientes;
}

async function avisarUsuario(usuarioId, proyecto, { tipo, descripcion }, conexion) {
  await pendientes.crear(
    { usuarioId, tipo, descripcion: `${proyecto.nombre}: ${descripcion}`, proyectoId: proyecto.id },
    conexion,
  );
}

// Se llama después de guardar. La respuesta no espera al servidor de correo; en Vercel,
// waitUntil mantiene viva la función hasta que salen los correos (en local no hace nada).
function enviarCorreos(clientes, proyecto, actualizacion) {
  const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'long', timeStyle: 'short' });
  const envio = Promise.all(clientes.map((cliente) => correo.enviar({
    para: cliente.correo,
    asunto: `Hay una actualización en tu proyecto ${proyecto.nombre}`,
    texto: [
      `Hola, ${cliente.nombre}:`,
      '',
      `Hay una actualización en tu proyecto «${proyecto.nombre}».`,
      '',
      `Tipo: ${NOMBRES_TIPO[actualizacion.tipo] || actualizacion.tipo}`,
      `Descripción: ${actualizacion.descripcion}`,
      `Fecha: ${fecha}`,
      `Responsable: ${actualizacion.responsable}`,
      '',
      `Para ver el detalle, entra al portal e inicia sesión: ${config.urlPortal}`,
      '',
      'Este es un aviso automático del Portal de Proyectos de T Efficiency.',
    ].join('\n'),
  })));
  waitUntil(envio);
  return envio;
}

module.exports = { avisarClientes, avisarUsuario, enviarCorreos, NOMBRES_TIPO };
