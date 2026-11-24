const fs = require('node:fs');
const db = require('../config/db');
const cotizaciones = require('../repositories/cotizaciones.repository');
const usuarios = require('../repositories/usuarios.repository');
const pendientes = require('../repositories/pendientes.repository');
const solicitudes = require('../repositories/solicitudes.repository');
const solicitudesService = require('./solicitudes.service');
const { ESTADOS_COTIZACION } = require('../validators/cotizacion.validator');
const { rutaRelativa, rutaAbsoluta } = require('../utils/archivos');
const { noEncontrado, solicitudInvalida, conflicto } = require('../utils/errores');

// Avisa en la campana a cada administrador, o solo al responsable si la solicitud ya tiene uno.
async function avisarPersonal({ tipo, descripcion, responsableId = null }, conexion) {
  const destinatarios = responsableId ? [{ id: responsableId }] : await usuarios.listarAdmins(conexion);
  for (const admin of destinatarios) {
    await pendientes.crear({ usuarioId: admin.id, tipo, descripcion }, conexion);
  }
}

// Guarda la cotización de un cliente registrado, la pone en la bandeja de solicitudes
// y avisa al personal en su campana (RF-12).
async function crear(usuario, datos, archivos = []) {
  return db.transaccion(async (conexion) => {
    const id = await cotizaciones.crear({ usuarioId: usuario.id, ...datos }, conexion);

    for (const archivo of archivos) {
      await cotizaciones.agregarArchivo(
        { cotizacionId: id, nombreOriginal: archivo.originalname, ruta: rutaRelativa('cotizaciones', archivo), tipoMime: archivo.mimetype },
        conexion,
      );
    }

    await solicitudesService.desdePortal(
      usuario,
      { categoria: 'cotizacion', descripcion: `Cotización de ${datos.tipoTrabajo}: ${datos.descripcion}`, cotizacionId: id },
      conexion,
    );
    await avisarPersonal({ tipo: 'cotizacion', descripcion: `Nueva cotización de ${usuario.nombre}: ${datos.tipoTrabajo}` }, conexion);

    return { id, estado: 'recibida', ...datos, archivos: archivos.length };
  });
}

// El personal ve todas; cada cliente ve solo las suyas.
async function listar(usuario) {
  return usuario.rol === 'admin' ? cotizaciones.listarTodas() : cotizaciones.listarDeUsuario(usuario.id);
}

// A un cliente que pide la cotización de otro se le responde "no existe", igual que con los proyectos.
async function verificarAcceso(usuario, cotizacionId, conexion) {
  const id = Number(cotizacionId);
  const cotizacion = Number.isInteger(id) && id > 0 ? await cotizaciones.buscarPorId(id, conexion) : null;
  if (!cotizacion || (usuario.rol === 'cliente' && cotizacion.clienteId !== usuario.id)) {
    throw noEncontrado('La cotización no existe.');
  }
  return cotizacion;
}

async function obtener(usuario, cotizacionId) {
  const cotizacion = await verificarAcceso(usuario, cotizacionId);
  return { ...cotizacion, archivos: await cotizaciones.listarArchivos(cotizacion.id) };
}

// Cambio a la cotización (RF-11). Si ya se había enviado, vuelve a revisión porque hay que cotizar de nuevo.
// Cuando el cambio lo hace el cliente, queda como solicitud de modificación y se avisa al personal.
async function modificar(usuario, cotizacionId, datos) {
  return db.transaccion(async (conexion) => {
    const actual = await verificarAcceso(usuario, cotizacionId, conexion);
    if (actual.proyectoId) throw conflicto('Esta cotización ya tiene su proyecto. Pide los cambios en el chat del proyecto.');
    await cotizaciones.modificar(actual.id, datos, conexion);
    const estado = actual.estado === 'enviada' ? 'en_revision' : actual.estado;
    if (estado !== actual.estado) await cotizaciones.cambiarEstado(actual.id, estado, conexion);

    if (usuario.rol === 'cliente') {
      const responsableId = await solicitudes.responsableDeCotizacion(actual.id, conexion);
      await solicitudesService.desdePortal(
        usuario,
        {
          categoria: 'modificacion',
          descripcion: `Cambió su cotización de ${datos.tipoTrabajo}: ${datos.descripcion}`,
          cotizacionId: actual.id,
          proyectoId: actual.proyectoId,
          responsableId,
        },
        conexion,
      );
      await avisarPersonal({ tipo: 'solicitud', descripcion: `${usuario.nombre} cambió su cotización de ${datos.tipoTrabajo}`, responsableId }, conexion);
    }
    return { ...actual, ...datos, estado };
  });
}

// El personal avanza la cotización: Recibida, En revisión o Enviada. El cliente recibe el aviso en su campana.
async function cambiarEstado(admin, cotizacionId, estado) {
  return db.transaccion(async (conexion) => {
    const actual = await verificarAcceso(admin, cotizacionId, conexion);
    if (actual.estado === estado) throw solicitudInvalida(`La cotización ya está «${ESTADOS_COTIZACION[estado]}».`);
    await cotizaciones.cambiarEstado(actual.id, estado, conexion);
    if (estado === 'enviada') await solicitudes.atenderPorCotizacion(actual.id, conexion);
    await pendientes.crear(
      { usuarioId: actual.clienteId, tipo: 'cotizacion', descripcion: `Tu cotización de ${actual.tipoTrabajo} está «${ESTADOS_COTIZACION[estado]}».` },
      conexion,
    );
    return { ...actual, estado };
  });
}

// Fotos o planos que adjuntó el cliente: los ven él y el personal, dentro del portal.
async function obtenerArchivoParaVer(usuario, archivoId) {
  const id = Number(archivoId);
  const archivo = Number.isInteger(id) && id > 0 ? await cotizaciones.buscarArchivo(id) : null;
  if (!archivo) throw noEncontrado('El archivo no existe.');
  await verificarAcceso(usuario, archivo.cotizacionId);
  const ruta = rutaAbsoluta(archivo.ruta);
  if (!fs.existsSync(ruta)) throw noEncontrado('El archivo ya no está disponible.');
  return { ...archivo, ruta };
}

module.exports = {
  crear, listar, obtener, modificar, cambiarEstado, obtenerArchivoParaVer,
};
