const db = require('../config/db');

const comoBooleano = (fila) => ({ ...fila, realizada: Boolean(fila.realizada) });

async function listarPorProyecto(proyectoId) {
  const filas = await db.consultar(
    `SELECT a.id, a.descripcion, a.realizada, a.realizada_en AS realizadaEn, u.nombre AS realizadaPor
       FROM actividades a
       LEFT JOIN usuarios u ON u.id = a.realizada_por
      WHERE a.proyecto_id = ?
      ORDER BY a.realizada, a.creado_en, a.id`,
    [proyectoId],
  );
  return filas.map(comoBooleano);
}

async function crear({ proyectoId, descripcion }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO actividades (proyecto_id, descripcion) VALUES (?, ?)',
    [proyectoId, descripcion],
    conexion,
  );
  return resultado.insertId;
}

async function buscarPorId(id, conexion) {
  const filas = await db.consultar(
    'SELECT id, proyecto_id AS proyectoId, descripcion, realizada FROM actividades WHERE id = ?',
    [id],
    conexion,
  );
  return filas[0] ? comoBooleano(filas[0]) : null;
}

// Solo cambia si todavía no estaba realizada. Devuelve cuántas filas cambió (0 o 1).
async function marcarRealizada(id, usuarioId, conexion) {
  const resultado = await db.consultar(
    'UPDATE actividades SET realizada = TRUE, realizada_en = NOW(), realizada_por = ? WHERE id = ? AND realizada = FALSE',
    [usuarioId, id],
    conexion,
  );
  return resultado.affectedRows;
}

module.exports = { listarPorProyecto, crear, buscarPorId, marcarRealizada };
