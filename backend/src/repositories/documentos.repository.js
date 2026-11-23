const db = require('../config/db');

async function crear({ proyectoId, nombre, ruta, tipoMime, subidoPor }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO documentos (proyecto_id, nombre, ruta, tipo_mime, subido_por) VALUES (?, ?, ?, ?, ?)',
    [proyectoId, nombre, ruta, tipoMime, subidoPor],
    conexion,
  );
  return resultado.insertId;
}

async function listarPorProyecto(proyectoId) {
  return db.consultar(
    `SELECT d.id, d.nombre, d.tipo_mime AS tipoMime, d.creado_en AS creadoEn, u.nombre AS subidoPor
        FROM documentos d
        JOIN usuarios u ON u.id = d.subido_por
      WHERE d.proyecto_id = ?
      ORDER BY d.creado_en DESC, d.id DESC`,
    [proyectoId],
  );
}

async function buscarPorId(id) {
  const filas = await db.consultar(
    'SELECT id, proyecto_id AS proyectoId, nombre, ruta, tipo_mime AS tipoMime FROM documentos WHERE id = ?',
    [id],
  );
  return filas[0] || null;
}

module.exports = { crear, listarPorProyecto, buscarPorId };
