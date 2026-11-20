const db = require('../config/db');

async function crear({ proyectoId, tipo, descripcion, responsableId }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO actualizaciones (proyecto_id, tipo, descripcion, responsable_id) VALUES (?, ?, ?, ?)',
    [proyectoId, tipo, descripcion.slice(0, 500), responsableId],
    conexion,
  );
  return resultado.insertId;
}

// Historial del proyecto: lo más reciente primero, con tipo, fecha y responsable (RF-06, RF-16).
async function listarPorProyecto(proyectoId) {
  return db.consultar(
    `SELECT a.id, a.tipo, a.descripcion, a.creado_en AS fecha, u.nombre AS responsable
        FROM actualizaciones a
        JOIN usuarios u ON u.id = a.responsable_id
      WHERE a.proyecto_id = ?
      ORDER BY a.creado_en DESC, a.id DESC`,
    [proyectoId],
  );
}

module.exports = { crear, listarPorProyecto };
