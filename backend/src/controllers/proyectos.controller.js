const proyectosService = require('../services/proyectos.service');
const { validarNuevoProyecto, validarEstado, validarDatosProyecto } = require('../validators/proyecto.validator');

async function listar(req, res) {
  res.json({ proyectos: await proyectosService.listar(req.usuario) });
}

async function obtener(req, res) {
  res.json({ proyecto: await proyectosService.obtener(req.usuario, req.params.id) });
}

async function crear(req, res) {
  const proyecto = await proyectosService.crear(req.usuario, validarNuevoProyecto(req.body));
  res.status(201).json({ proyecto });
}

async function cambiarEstado(req, res) {
  const proyecto = await proyectosService.cambiarEstado(req.usuario, req.params.id, validarEstado(req.body));
  res.json({ proyecto });
}

async function actualizarDatos(req, res) {
  const proyecto = await proyectosService.actualizarDatos(req.usuario, req.params.id, validarDatosProyecto(req.body));
  res.json({ proyecto });
}

async function historial(req, res) {
  res.json({ historial: await proyectosService.historial(req.usuario, req.params.id) });
}

module.exports = { listar, obtener, crear, cambiarEstado, actualizarDatos, historial };
