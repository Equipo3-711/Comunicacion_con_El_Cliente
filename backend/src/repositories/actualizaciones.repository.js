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

async function agregarFoto({ actualizacionId, ruta, tipoMime }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO actualizacion_fotos (actualizacion_id, ruta, tipo_mime) VALUES (?, ?, ?)',
    [actualizacionId, ruta, tipoMime],
    conexion,
  );
  return resultado.insertId;
}

// Fotos de todas las actualizaciones de un proyecto, para unirlas al historial.
async function listarFotosPorProyecto(proyectoId) {
  return db.consultar(
    `SELECT f.id, f.actualizacion_id AS actualizacionId
        FROM actualizacion_fotos f
        JOIN actualizaciones a ON a.id = f.actualizacion_id
      WHERE a.proyecto_id = ?
      ORDER BY f.id`,
    [proyectoId],
  );
}

// Devuelve la foto con el proyecto al que pertenece, para revisar el acceso antes de mostrarla.
async function buscarFoto(id) {
  const filas = await db.consultar(
    `SELECT f.id, f.ruta, f.tipo_mime AS tipoMime, a.proyecto_id AS proyectoId
        FROM actualizacion_fotos f
        JOIN actualizaciones a ON a.id = f.actualizacion_id
      WHERE f.id = ?`,
    [id],
  );
  return filas[0] || null;
}

module.exports = { crear, listarPorProyecto, agregarFoto, listarFotosPorProyecto, buscarFoto };
