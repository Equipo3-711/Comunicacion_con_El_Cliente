const solicitudesService = require('../services/solicitudes.service');
const { validarNuevaSolicitud, validarCambiosSolicitud, validarFiltros } = require('../validators/solicitud.validator');

async function listar(req, res) {
  res.json({ solicitudes: await solicitudesService.listar(req.usuario, validarFiltros(req.query)) });
}

async function registrar(req, res) {
  const solicitud = await solicitudesService.registrar(req.usuario, validarNuevaSolicitud(req.body));
  res.status(201).json({ solicitud });
}

async function actualizar(req, res) {
  const solicitud = await solicitudesService.actualizar(req.usuario, req.params.id, validarCambiosSolicitud(req.body));
  res.json({ solicitud });
}

async function responsables(req, res) {
  res.json({ responsables: await solicitudesService.responsables() });
}

module.exports = { listar, registrar, actualizar, responsables };
