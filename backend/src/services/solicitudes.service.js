// Bandeja de solicitudes del personal: todo lo que piden los clientes, llegue por donde llegue (RF-01),
// clasificado (RF-04) y con un responsable que recibe el aviso en su campana (RF-05, RF-12).
const db = require('../config/db');
const solicitudes = require('../repositories/solicitudes.repository');
const usuarios = require('../repositories/usuarios.repository');
const proyectos = require('../repositories/proyectos.repository');
const pendientes = require('../repositories/pendientes.repository');
const { CATEGORIAS } = require('../validators/solicitud.validator');
const { noEncontrado, solicitudInvalida } = require('../utils/errores');

const invalida = (campo, mensaje) => solicitudInvalida('Revisa los campos marcados.', { [campo]: mensaje });

async function verificarResponsable(id, conexion) {
  const usuario = await usuarios.buscarPorId(id, conexion);
  if (usuario?.rol !== 'admin') throw invalida('responsableId', 'El responsable debe ser alguien del personal.');
  return usuario;
}

async function verificarCliente(id, conexion) {
  const usuario = await usuarios.buscarPorId(id, conexion);
  if (usuario?.rol !== 'cliente') throw invalida('clienteId', 'El cliente no existe.');
  return usuario;
}

// Si se indica el cliente, el proyecto tiene que ser de su empresa.
async function verificarProyecto(proyectoId, cliente, conexion) {
  const proyecto = await proyectos.buscarPorId(proyectoId, conexion);
  if (!proyecto) throw invalida('proyectoId', 'El proyecto no existe.');
  if (cliente && proyecto.empresaId !== cliente.empresaId) throw invalida('proyectoId', 'El proyecto no es de este cliente.');
  return proyecto;
}

async function buscar(id, conexion) {
  const numero = Number(id);
  const solicitud = Number.isInteger(numero) && numero > 0 ? await solicitudes.buscarPorId(numero, conexion) : null;
  if (!solicitud) throw noEncontrado('La solicitud no existe.');
  return solicitud;
}

// Aviso en la campana del responsable, salvo que él mismo hizo el cambio.
async function avisarAsignacion(responsableId, quien, { contacto, categoria }, conexion) {
  if (!responsableId || responsableId === quien.id) return;
  await pendientes.crear(
    { usuarioId: responsableId, tipo: 'solicitud', descripcion: `Te asignaron una solicitud de ${contacto}: ${CATEGORIAS[categoria]}` },
    conexion,
  );
}

async function listar(admin, { responsable, ...filtros } = {}) {
  return solicitudes.listar({
    ...filtros,
    responsableId: responsable === 'yo' ? admin.id : undefined,
    sinAsignar: responsable === 'sin_asignar',
  });
}

// El personal registra lo que llegó por WhatsApp, una llamada, redes sociales, correo o en persona.
// Si no elige responsable, la solicitud queda a su cargo.
async function registrar(admin, datos) {
  return db.transaccion(async (conexion) => {
    const cliente = datos.clienteId ? await verificarCliente(datos.clienteId, conexion) : null;
    if (datos.proyectoId) await verificarProyecto(datos.proyectoId, cliente, conexion);
    const responsableId = datos.responsableId ?? admin.id;
    if (responsableId !== admin.id) await verificarResponsable(responsableId, conexion);

    const id = await solicitudes.crear({ ...datos, responsableId, registradaPor: admin.id }, conexion);
    await avisarAsignacion(responsableId, admin, { contacto: cliente?.nombre ?? datos.contactoNombre, categoria: datos.categoria }, conexion);
    return solicitudes.buscarPorId(id, conexion);
  });
}

async function actualizar(admin, id, cambios) {
  return db.transaccion(async (conexion) => {
    const solicitud = await buscar(id, conexion);
    if (cambios.responsableId && cambios.responsableId !== solicitud.responsableId) {
      await verificarResponsable(cambios.responsableId, conexion);
      await avisarAsignacion(cambios.responsableId, admin, { ...solicitud, ...cambios }, conexion);
    }
    await solicitudes.actualizar(solicitud.id, cambios, conexion);
    return solicitudes.buscarPorId(solicitud.id, conexion);
  });
}

// Lo que el cliente pide desde el portal (una cotización o un cambio a ella) también entra a la bandeja.
// Se llama dentro de la transacción de quien la crea.
async function desdePortal(cliente, { categoria, descripcion, cotizacionId = null, proyectoId = null, responsableId = null }, conexion) {
  return solicitudes.crear(
    { canal: 'portal', categoria, descripcion, clienteId: cliente.id, cotizacionId, proyectoId, responsableId, registradaPor: cliente.id },
    conexion,
  );
}

async function responsables() {
  const personal = await usuarios.listarAdmins();
  return personal.map(({ id, nombre }) => ({ id, nombre }));
}

module.exports = { listar, registrar, actualizar, desdePortal, responsables };
