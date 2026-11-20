const cotizacionesService = require('../services/cotizaciones.service');
const { validarCotizacion } = require('../validators/cotizacion.validator');
const { borrarArchivos } = require('../utils/archivos');

async function crear(req, res) {
  const archivos = req.files || [];
  try {
    const datos = validarCotizacion(req.body);
    const cotizacion = await cotizacionesService.crear(req.usuario, datos, archivos);
    res.status(201).json({ cotizacion });
  } catch (error) {
    await borrarArchivos(archivos);
    throw error;
  }
}

async function listar(req, res) {
  res.json({ cotizaciones: await cotizacionesService.listar(req.usuario) });
}

module.exports = { crear, listar };
