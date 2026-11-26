const preguntasService = require('../services/preguntas.service');
const { validarPregunta, validarConsulta } = require('../validators/pregunta.validator');

async function listar(req, res) {
  res.json({ preguntas: await preguntasService.listar(req.usuario) });
}

async function sugerencias(req, res) {
  res.json({ sugerencias: await preguntasService.sugerir(validarConsulta(req.query)) });
}

async function crear(req, res) {
  const pregunta = await preguntasService.crear(req.usuario, validarPregunta(req.body));
  res.status(201).json({ pregunta });
}

async function actualizar(req, res) {
  res.json({ pregunta: await preguntasService.actualizar(req.params.id, validarPregunta(req.body)) });
}

async function eliminar(req, res) {
  await preguntasService.eliminar(req.params.id);
  res.status(204).end();
}

async function resuelta(req, res) {
  await preguntasService.marcarResuelta(req.params.id);
  res.status(204).end();
}

module.exports = { listar, sugerencias, crear, actualizar, eliminar, resuelta };
