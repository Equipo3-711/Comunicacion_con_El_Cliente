const {
  requerido, maximo, unoDe, enteroPositivo, numeroNoNegativo, fecha, validar, texto, vacio,
} = require('./comunes');
const { TIPOS_TRABAJO } = require('./cotizacion.validator');
const { solicitudInvalida } = require('../utils/errores');

const ESTADOS = {
  cotizacion: 'En cotización',
  en_proceso: 'En proceso',
  en_instalacion: 'En instalación',
  terminado: 'Terminado',
};

const numeroONulo = (valor) => (vacio(valor) ? null : Number(valor));

function lanzarSiHayErrores(errores) {
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
}

function validarNuevoProyecto(datos) {
  lanzarSiHayErrores(validar(datos, {
    empresaId: [requerido('Elige la empresa del cliente.'), enteroPositivo()],
    nombre: [requerido('Escribe el nombre de la obra.'), maximo(150)],
    tipoTrabajo: [requerido('Elige el tipo de trabajo.'), unoDe(TIPOS_TRABAJO)],
    presupuesto: [numeroNoNegativo()],
    garantiaHasta: [fecha()],
    notasInternas: [maximo(2000)],
  }));
  return {
    empresaId: Number(datos.empresaId),
    nombre: texto(datos.nombre),
    tipoTrabajo: texto(datos.tipoTrabajo).toLowerCase(),
    presupuesto: numeroONulo(datos.presupuesto),
    garantiaHasta: vacio(datos.garantiaHasta) ? null : datos.garantiaHasta,
    notasInternas: texto(datos.notasInternas) || null,
  };
}

function validarEstado(datos) {
  lanzarSiHayErrores(validar(datos, { estado: [requerido('Elige el nuevo estado.'), unoDe(Object.keys(ESTADOS))] }));
  return texto(datos.estado).toLowerCase();
}

function validarDatosProyecto(datos = {}) {
  lanzarSiHayErrores(validar(datos, {
    presupuesto: [numeroNoNegativo()],
    pagado: [numeroNoNegativo()],
    garantiaHasta: [fecha()],
    notasInternas: [maximo(2000)],
  }));
  const cambios = {};
  if ('presupuesto' in datos) cambios.presupuesto = numeroONulo(datos.presupuesto);
  if ('pagado' in datos) cambios.pagado = numeroONulo(datos.pagado) ?? 0;
  if ('garantiaHasta' in datos) cambios.garantiaHasta = vacio(datos.garantiaHasta) ? null : datos.garantiaHasta;
  if ('notasInternas' in datos) cambios.notasInternas = texto(datos.notasInternas) || null;
  if (Object.keys(cambios).length === 0) {
    throw solicitudInvalida('Envía al menos uno de estos campos: presupuesto, pagado, garantiaHasta o notasInternas.');
  }
  return cambios;
}

module.exports = { validarNuevoProyecto, validarEstado, validarDatosProyecto, ESTADOS };
