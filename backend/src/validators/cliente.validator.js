// Alta de un cliente por el personal, con su primer proyecto (RF-02: «o que el personal lo dé de alta»).
const { requerido, maximo, minimo, correo, telefono, unoDe, validar, texto } = require('./comunes');
const { TIPOS_TRABAJO } = require('./cotizacion.validator');
const { solicitudInvalida } = require('../utils/errores');

const REGLAS = {
  nombre: [requerido('Escribe el nombre del contacto.'), maximo(120)],
  empresa: [requerido('Escribe la empresa o el nombre del cliente.'), maximo(150)],
  correo: [requerido(), correo(), maximo(160)],
  telefono: [requerido(), telefono()],
  contrasena: [requerido('Escribe una contraseña inicial para el cliente.'), minimo(8, 'La contraseña debe tener al menos 8 caracteres.'), maximo(72)],
  nombreProyecto: [requerido('Escribe el nombre de la obra.'), maximo(150)],
  tipoTrabajo: [requerido('Elige el tipo de trabajo.'), unoDe(TIPOS_TRABAJO)],
};

function validarNuevoCliente(datos) {
  const errores = validar(datos, REGLAS);
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
  return {
    nombre: texto(datos.nombre),
    empresa: texto(datos.empresa),
    correo: texto(datos.correo).toLowerCase(),
    telefono: texto(datos.telefono),
    contrasena: datos.contrasena,
    proyecto: { nombre: texto(datos.nombreProyecto), tipoTrabajo: texto(datos.tipoTrabajo).toLowerCase() },
  };
}

module.exports = { validarNuevoCliente };
