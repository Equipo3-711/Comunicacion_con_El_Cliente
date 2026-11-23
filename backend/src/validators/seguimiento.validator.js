const { requerido, maximo, unoDe, validar, texto } = require('./comunes');
const { solicitudInvalida } = require('../utils/errores');

// Tipos que el personal registra a mano. "cambio_estado" y "documento" los crea el sistema.
const TIPOS_MANUALES = ['avance', 'solicitud'];

function lanzarSiHayErrores(errores) {
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
}

function validarActualizacion(datos = {}) {
  lanzarSiHayErrores(validar(datos, {
    tipo: [unoDe(TIPOS_MANUALES)],
    descripcion: [requerido('Describe la actualización.'), maximo(500)],
  }));
  return { tipo: texto(datos.tipo).toLowerCase() || 'avance', descripcion: texto(datos.descripcion) };
}

function validarActividad(datos = {}) {
  lanzarSiHayErrores(validar(datos, { descripcion: [requerido('Describe la actividad.'), maximo(255)] }));
  return { descripcion: texto(datos.descripcion) };
}

module.exports = { validarActualizacion, validarActividad, TIPOS_MANUALES };
