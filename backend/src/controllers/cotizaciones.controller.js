const cotizacionesService = require('../services/cotizaciones.service');
const { validarCotizacion, validarEstadoCotizacion } = require('../validators/cotizacion.validator');
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

async function obtener(req, res) {
  res.json({ cotizacion: await cotizacionesService.obtener(req.usuario, req.params.id) });
}

async function modificar(req, res) {
  const cotizacion = await cotizacionesService.modificar(req.usuario, req.params.id, validarCotizacion(req.body));
  res.json({ cotizacion });
}

async function cambiarEstado(req, res) {
  const cotizacion = await cotizacionesService.cambiarEstado(req.usuario, req.params.id, validarEstadoCotizacion(req.body));
  res.json({ cotizacion });
}

// Igual que los documentos: se muestra dentro del portal, sin enlace de descarga.
async function verArchivo(req, res) {
  const archivo = await cotizacionesService.obtenerArchivoParaVer(req.usuario, req.params.id);
  res.set({
    'Content-Type': archivo.tipoMime,
    'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(archivo.nombre)}`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  archivo.guardado.enviar(res);
}

module.exports = {
  crear, listar, obtener, modificar, cambiarEstado, verArchivo,
};
