// Solicitudes de los clientes (RF-01, RF-04, RF-05). El personal las registra en un solo formulario (RNF-01).
const {
  requerido, maximo, unoDe, enteroPositivo, telefono, validar, texto, vacio,
} = require('./comunes');
const { solicitudInvalida } = require('../utils/errores');

// Por dónde llegó la solicitud (RF-01, T-01). «portal» es la página web del portal.
const CANALES = {
  portal: 'Portal web',
  whatsapp: 'WhatsApp',
  llamada: 'Llamada',
  redes_sociales: 'Redes sociales',
  correo: 'Correo',
  presencial: 'En persona',
};

const CATEGORIAS = {
  cotizacion: 'Cotización',
  duda: 'Duda',
  modificacion: 'Modificación',
  queja: 'Queja',
  seguimiento: 'Seguimiento',
  informacion: 'Información general',
};

const ESTADOS_SOLICITUD = {
  nueva: 'Nueva',
  en_atencion: 'En atención',
  atendida: 'Atendida',
};

const idONulo = (valor) => (vacio(valor) ? null : Number(valor));
const minuscula = (valor) => texto(valor).toLowerCase();

function lanzarSiHayErrores(errores) {
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
}

// Quien pide algo es un cliente con cuenta o, si no tiene, una persona con nombre y teléfono.
function contactoRequerido(valor, datos) {
  return vacio(datos.clienteId) && vacio(valor) ? 'Elige un cliente o escribe el nombre de quien llamó o escribió.' : null;
}

// Al reasignar no se puede dejar la solicitud sin responsable.
function responsableElegido(valor, datos) {
  return 'responsableId' in datos && vacio(valor) ? 'Elige al responsable.' : null;
}

function validarNuevaSolicitud(datos = {}) {
  lanzarSiHayErrores(validar(datos, {
    canal: [requerido('Elige por dónde llegó la solicitud.'), unoDe(Object.keys(CANALES))],
    categoria: [requerido('Elige de qué se trata.'), unoDe(Object.keys(CATEGORIAS))],
    descripcion: [requerido('Escribe qué pidió el cliente.'), maximo(1000)],
    clienteId: [enteroPositivo()],
    contactoNombre: [contactoRequerido, maximo(120)],
    contactoTelefono: [telefono()],
    proyectoId: [enteroPositivo()],
    responsableId: [enteroPositivo()],
  }));
  const clienteId = idONulo(datos.clienteId);
  return {
    canal: minuscula(datos.canal),
    categoria: minuscula(datos.categoria),
    descripcion: texto(datos.descripcion),
    clienteId,
    // Con un cliente registrado, su nombre y teléfono ya están en su cuenta.
    contactoNombre: clienteId ? null : texto(datos.contactoNombre),
    contactoTelefono: clienteId ? null : texto(datos.contactoTelefono) || null,
    proyectoId: idONulo(datos.proyectoId),
    responsableId: idONulo(datos.responsableId),
  };
}

// Clasificar, cambiar el estado o asignar el responsable; se puede mandar uno o varios.
function validarCambiosSolicitud(datos = {}) {
  lanzarSiHayErrores(validar(datos, {
    categoria: [unoDe(Object.keys(CATEGORIAS))],
    estado: [unoDe(Object.keys(ESTADOS_SOLICITUD))],
    responsableId: [responsableElegido, enteroPositivo()],
  }));
  const cambios = {};
  if (!vacio(datos.categoria)) cambios.categoria = minuscula(datos.categoria);
  if (!vacio(datos.estado)) cambios.estado = minuscula(datos.estado);
  if ('responsableId' in datos) cambios.responsableId = Number(datos.responsableId);
  if (Object.keys(cambios).length === 0) {
    throw solicitudInvalida('Envía al menos uno de estos campos: categoria, estado o responsableId.');
  }
  return cambios;
}

// Filtros de la bandeja. Un filtro con un valor que no existe se rechaza en lugar de ignorarse.
function validarFiltros(consulta = {}) {
  lanzarSiHayErrores(validar(consulta, {
    canal: [unoDe(Object.keys(CANALES))],
    categoria: [unoDe(Object.keys(CATEGORIAS))],
    estado: [unoDe(Object.keys(ESTADOS_SOLICITUD))],
    responsable: [unoDe(['yo', 'sin_asignar'])],
  }));
  const filtros = {};
  for (const campo of ['canal', 'categoria', 'estado', 'responsable']) {
    if (!vacio(consulta[campo])) filtros[campo] = minuscula(consulta[campo]);
  }
  return filtros;
}

module.exports = {
  validarNuevaSolicitud, validarCambiosSolicitud, validarFiltros, CANALES, CATEGORIAS, ESTADOS_SOLICITUD,
};
