// Reglas pequeñas para validar lo que llega del formulario.
// Cada regla devuelve un mensaje si el campo está mal, o null si está bien.

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');
const vacio = (valor) => valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

function requerido(mensaje = 'Este campo es obligatorio.') {
  return (valor) => (vacio(valor) ? mensaje : null);
}

function enteroPositivo(mensaje = 'Elige una opción válida.') {
  return (valor) => (vacio(valor) || (Number.isInteger(Number(valor)) && Number(valor) > 0) ? null : mensaje);
}

function numeroNoNegativo(mensaje = 'Escribe una cantidad mayor o igual a cero.') {
  return (valor) => (vacio(valor) || (Number.isFinite(Number(valor)) && Number(valor) >= 0) ? null : mensaje);
}

function fecha(mensaje = 'Escribe la fecha como AAAA-MM-DD.') {
  return (valor) => (vacio(valor) || (/^\d{4}-\d{2}-\d{2}$/.test(String(valor)) && !Number.isNaN(Date.parse(valor))) ? null : mensaje);
}

function maximo(caracteres) {
  return (valor) => (texto(valor).length > caracteres ? `Escribe como máximo ${caracteres} caracteres.` : null);
}

function minimo(caracteres, mensaje) {
  return (valor) => (texto(valor) && texto(valor).length < caracteres ? mensaje : null);
}

function unoDe(opciones, mensaje = `Elige una opción válida: ${opciones.join(', ')}.`) {
  return (valor) => (texto(valor) && !opciones.includes(texto(valor).toLowerCase()) ? mensaje : null);
}

function correo() {
  return (valor) => (texto(valor) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(valor)) ? 'Escribe un correo válido.' : null);
}

function telefono() {
  return (valor) => {
    const digitos = texto(valor).replace(/\D/g, '');
    return texto(valor) && (digitos.length < 10 || digitos.length > 15) ? 'Escribe un teléfono de 10 a 15 dígitos.' : null;
  };
}

// Aplica las reglas y devuelve { campo: mensaje } con el primer error de cada campo.
function validar(datos, reglasPorCampo) {
  const errores = {};
  for (const [campo, reglas] of Object.entries(reglasPorCampo)) {
    for (const regla of reglas) {
      const mensaje = regla(datos?.[campo], datos);
      if (mensaje) {
        errores[campo] = mensaje;
        break;
      }
    }
  }
  return errores;
}

module.exports = {
  texto, vacio, requerido, maximo, minimo, unoDe, correo, telefono, enteroPositivo, numeroNoNegativo, fecha, validar,
};
