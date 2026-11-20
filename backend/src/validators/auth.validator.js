const { requerido, maximo, minimo, correo, telefono, validar, texto } = require('./comunes');
const { solicitudInvalida } = require('../utils/errores');

const REGLAS_REGISTRO = {
  nombre: [requerido(), maximo(120)],
  empresa: [requerido(), maximo(150)],
  correo: [requerido(), correo(), maximo(160)],
  telefono: [requerido(), telefono()],
  contrasena: [requerido(), minimo(8, 'La contraseña debe tener al menos 8 caracteres.'), maximo(72)],
  confirmarContrasena: [
    requerido('Confirma la contraseña.'),
    (valor, datos) => (valor !== datos.contrasena ? 'Las contraseñas no coinciden.' : null),
  ],
};

const REGLAS_LOGIN = {
  correo: [requerido()],
  contrasena: [requerido()],
};

function validarRegistro(datos) {
  const errores = validar(datos, REGLAS_REGISTRO);
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los campos marcados.', errores);
  return {
    nombre: texto(datos.nombre),
    empresa: texto(datos.empresa),
    correo: texto(datos.correo).toLowerCase(),
    telefono: texto(datos.telefono),
    contrasena: datos.contrasena,
  };
}

function validarLogin(datos) {
  const errores = validar(datos, REGLAS_LOGIN);
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Escribe tu correo y tu contraseña.', errores);
  return { correo: texto(datos.correo).toLowerCase(), contrasena: datos.contrasena };
}

module.exports = { validarRegistro, validarLogin };
