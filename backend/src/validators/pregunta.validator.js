// Preguntas frecuentes que configura el personal (RF-13).
const { requerido, maximo, validar, texto, vacio } = require('./comunes');
const { solicitudInvalida } = require('../utils/errores');

// Las palabras clave van separadas por comas: «garantía, garantias, cuánto dura».
function separarPalabras(valor) {
  return texto(valor).split(',').map((palabra) => palabra.trim()).filter(Boolean);
}

function algunaPalabra(valor) {
  return !vacio(valor) && !separarPalabras(valor).some((palabra) => palabra.length >= 3)
    ? 'Escribe al menos una palabra clave de 3 letras o más.'
    : null;
}

function siONo(valor) {
  return valor === undefined || typeof valor === 'boolean' ? null : 'Elige si la pregunta está activa.';
}

const REGLAS = {
  pregunta: [requerido('Escribe la pregunta.'), maximo(200)],
  respuesta: [requerido('Escribe la respuesta.'), maximo(1000)],
  palabrasClave: [requerido('Escribe las palabras clave, separadas por comas.'), maximo(300), algunaPalabra],
  activa: [siONo],
};

function validarPregunta(datos) {
  const errores = validar(datos, REGLAS);
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los datos marcados.', errores);
  return {
    pregunta: texto(datos.pregunta),
    respuesta: texto(datos.respuesta),
    // Se guardan limpias: sin espacios de más ni comas repetidas.
    palabrasClave: separarPalabras(datos.palabrasClave).join(', '),
    activa: datos.activa ?? true,
  };
}

function validarConsulta(consulta) {
  const errores = validar(consulta, { texto: [requerido('Escribe tu duda.'), maximo(1000)] });
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa los datos marcados.', errores);
  return texto(consulta.texto);
}

module.exports = { validarPregunta, validarConsulta, separarPalabras };
