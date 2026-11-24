// Campos de la sección «Formulario de cotización» de docs/REQUERIMIENTOS.md (CC-10).
// Cliente y correo no se piden: salen de la cuenta con sesión iniciada.
const { requerido, maximo, unoDe, telefono, validar, texto } = require('./comunes');
const { solicitudInvalida } = require('../utils/errores');

const TIPOS_CLIENTE = ['particular', 'constructora', 'arquitecto', 'otro'];
const TIPOS_TRABAJO = ['ventanas', 'fachada', 'canceles', 'barandales'];

const REGLAS = {
  telefono: [requerido(), telefono()],
  tipoCliente: [requerido('Elige qué tipo de cliente eres.'), unoDe(TIPOS_CLIENTE)],
  tipoTrabajo: [requerido('Elige el tipo de trabajo.'), unoDe(TIPOS_TRABAJO)],
  direccion: [requerido('Escribe la dirección de la obra: calle, número, colonia y ciudad.'), maximo(255)],
  medidas: [maximo(255)],
  descripcion: [requerido('Cuéntanos qué necesitas.'), maximo(2000)],
};

function validarCotizacion(datos) {
  const errores = validar(datos, REGLAS);
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
  return {
    telefono: texto(datos.telefono),
    tipoCliente: texto(datos.tipoCliente).toLowerCase(),
    tipoTrabajo: texto(datos.tipoTrabajo).toLowerCase(),
    direccion: texto(datos.direccion),
    medidas: texto(datos.medidas) || null,
    descripcion: texto(datos.descripcion),
  };
}

const ESTADOS_COTIZACION = {
  recibida: 'Recibida',
  en_revision: 'En revisión',
  enviada: 'Enviada',
};

function validarEstadoCotizacion(datos) {
  const errores = validar(datos, { estado: [requerido('Elige el nuevo estado.'), unoDe(Object.keys(ESTADOS_COTIZACION))] });
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
  return texto(datos.estado).toLowerCase();
}

module.exports = {
  validarCotizacion, validarEstadoCotizacion, TIPOS_CLIENTE, TIPOS_TRABAJO, ESTADOS_COTIZACION,
};
