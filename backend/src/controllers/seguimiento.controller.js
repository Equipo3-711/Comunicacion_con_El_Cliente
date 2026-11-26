const seguimiento = require('../services/seguimiento.service');
const { validarActualizacion, validarActividad } = require('../validators/seguimiento.validator');
const { borrarArchivos } = require('../utils/archivos');

// Acepta JSON o un formulario con fotos opcionales en el campo "fotos".
async function registrarActualizacion(req, res) {
  const fotos = req.files || [];
  try {
    const datos = validarActualizacion(req.body);
    const actualizacion = await seguimiento.registrarActualizacion(req.usuario, req.params.id, datos, fotos);
    res.status(201).json({ actualizacion });
  } catch (error) {
    await borrarArchivos(fotos);
    throw error;
  }
}

// Muestra la foto dentro del portal, igual que los documentos.
async function verFoto(req, res) {
  const foto = await seguimiento.obtenerFotoParaVer(req.usuario, req.params.id);
  res.set({ 'Content-Type': foto.tipoMime, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  foto.guardado.enviar(res);
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

module.exports = { registrarActualizacion, verFoto, listarActividades, crearActividad, marcarRealizada };
