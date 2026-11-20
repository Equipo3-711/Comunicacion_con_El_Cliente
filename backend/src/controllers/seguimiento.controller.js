const seguimiento = require('../services/seguimiento.service');
const { validarActualizacion, validarActividad } = require('../validators/seguimiento.validator');

async function registrarActualizacion(req, res) {
  const actualizacion = await seguimiento.registrarActualizacion(req.usuario, req.params.id, validarActualizacion(req.body));
  res.status(201).json({ actualizacion });
}

async function listarActividades(req, res) {
  res.json({ actividades: await seguimiento.listarActividades(req.usuario, req.params.id) });
}

async function crearActividad(req, res) {
  const actividad = await seguimiento.crearActividad(req.usuario, req.params.id, validarActividad(req.body));
  res.status(201).json({ actividad });
}

async function marcarRealizada(req, res) {
  res.json({ actualizacion: await seguimiento.marcarRealizada(req.usuario, req.params.id) });
}

module.exports = { registrarActualizacion, listarActividades, crearActividad, marcarRealizada };
