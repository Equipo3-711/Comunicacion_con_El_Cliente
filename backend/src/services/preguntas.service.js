// Respuestas automáticas para preguntas frecuentes previamente configuradas (RF-13).
// No usa inteligencia artificial: compara la duda con las palabras clave que escribió el personal.
// Así no tiene costo, responde siempre lo mismo y ningún dato del cliente sale del portal.
const preguntas = require('../repositories/preguntas.repository');
const { separarPalabras } = require('../validators/pregunta.validator');
const { noEncontrado } = require('../utils/errores');

const MAX_SUGERENCIAS = 3;

// Sin acentos, sin mayúsculas y sin signos: «¿Cuánto DURA la garantía?» → «cuanto dura la garantia».
function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
}

// Una palabra suelta también cuenta con plural o terminación distinta («garantía» encuentra «garantías»).
// Una frase de varias palabras tiene que aparecer completa.
function aparece(frase, palabras, textoCompleto) {
  if (!frase.includes(' ')) return palabras.some((palabra) => palabra.startsWith(frase));
  return ` ${textoCompleto} `.includes(` ${frase} `);
}

function puntaje(pregunta, duda) {
  const texto = normalizar(duda);
  const palabras = texto.split(' ');
  return separarPalabras(pregunta.palabrasClave)
    .map(normalizar)
    .filter((frase) => frase.length >= 3)
    .filter((frase) => aparece(frase, palabras, texto)).length;
}

// Lo que ve el cliente: solo la pregunta y su respuesta.
const publica = ({ id, pregunta, respuesta }) => ({ id, pregunta, respuesta });

async function listar(usuario) {
  if (usuario.rol === 'admin') return preguntas.listar();
  return (await preguntas.listar({ soloActivas: true })).map(publica);
}

// Las que más palabras clave comparten con la duda; si empatan, las que más dudas han resuelto.
async function sugerir(duda) {
  const activas = await preguntas.listar({ soloActivas: true });
  return activas
    .map((pregunta) => ({ pregunta, puntos: puntaje(pregunta, duda) }))
    .filter(({ puntos }) => puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || b.pregunta.resueltas - a.pregunta.resueltas)
    .slice(0, MAX_SUGERENCIAS)
    .map(({ pregunta }) => publica(pregunta));
}

async function buscar(id) {
  const pregunta = await preguntas.buscarPorId(Number(id));
  if (!pregunta) throw noEncontrado('La pregunta frecuente no existe.');
  return pregunta;
}

async function crear(admin, datos) {
  const id = await preguntas.crear(datos, admin.id);
  return preguntas.buscarPorId(id);
}

async function actualizar(id, datos) {
  const pregunta = await buscar(id);
  await preguntas.actualizar(pregunta.id, datos);
  return preguntas.buscarPorId(pregunta.id);
}

async function eliminar(id) {
  const pregunta = await buscar(id);
  await preguntas.eliminar(pregunta.id);
}

async function marcarResuelta(id) {
  const cambiadas = await preguntas.sumarResuelta(Number(id) || 0);
  if (cambiadas === 0) throw noEncontrado('La pregunta frecuente no existe.');
}

module.exports = { normalizar, puntaje, listar, sugerir, crear, actualizar, eliminar, marcarResuelta };
