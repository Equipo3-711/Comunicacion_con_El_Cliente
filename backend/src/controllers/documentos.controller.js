const documentosService = require('../services/documentos.service');
const { borrarArchivos } = require('../utils/archivos');

async function listar(req, res) {
  res.json({ documentos: await documentosService.listar(req.usuario, req.params.id) });
}

async function subir(req, res) {
  try {
    const documento = await documentosService.subir(req.usuario, req.params.id, req.file, req.body?.nombre);
    res.status(201).json({ documento });
  } catch (error) {
    await borrarArchivos(req.file ? [req.file] : []);
    throw error;
  }
}

// Entrega el archivo para mostrarse dentro del portal, no para descargarse (CC-02).
// Límite aceptado en CC-02: el sistema no puede impedir una captura de pantalla.
async function ver(req, res) {
  const documento = await documentosService.obtenerParaVer(req.usuario, req.params.id);
  res.set({
    'Content-Type': documento.tipoMime,
    'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(documento.nombre)}`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  documento.guardado.enviar(res);
}

module.exports = { listar, subir, ver };
