const db = require('../config/db');

async function crear({ usuarioId, tipo, descripcion, proyectoId = null }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO pendientes (usuario_id, tipo, descripcion, proyecto_id) VALUES (?, ?, ?, ?)',
    [usuarioId, tipo, descripcion.slice(0, 255), proyectoId],
    conexion,
  );
  return resultado.insertId;
}

async function listarSinLeer(usuarioId) {
  return db.consultar(
    `SELECT id, tipo, descripcion, proyecto_id AS proyectoId, creado_en AS creadoEn
       FROM pendientes
      WHERE usuario_id = ? AND leido = FALSE
      ORDER BY creado_en DESC, id DESC`,
    [usuarioId],
  );
}

// Solo marca pendientes del propio usuario. Devuelve cuántos cambió.
async function marcarLeido(id, usuarioId) {
  const resultado = await db.consultar(
    'UPDATE pendientes SET leido = TRUE WHERE id = ? AND usuario_id = ?',
    [id, usuarioId],
  );
  return resultado.affectedRows;
}

async function marcarTodosLeidos(usuarioId) {
  const resultado = await db.consultar(
    'UPDATE pendientes SET leido = TRUE WHERE usuario_id = ? AND leido = FALSE',
    [usuarioId],
  );
  return resultado.affectedRows;
}

module.exports = { crear, listarSinLeer, marcarLeido, marcarTodosLeidos };
