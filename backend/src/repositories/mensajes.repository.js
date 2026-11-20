const db = require('../config/db');

async function crear({ proyectoId, autorId, texto }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO mensajes (proyecto_id, autor_id, texto) VALUES (?, ?, ?)',
    [proyectoId, autorId, texto],
    conexion,
  );
  return resultado.insertId;
}

async function listarPorProyecto(proyectoId) {
  return db.consultar(
    `SELECT m.id, m.texto, m.creado_en AS creadoEn, u.id AS autorId, u.nombre AS autor, u.rol AS rolAutor
       FROM mensajes m
       JOIN usuarios u ON u.id = m.autor_id
      WHERE m.proyecto_id = ?
      ORDER BY m.creado_en, m.id`,
    [proyectoId],
  );
}

module.exports = { crear, listarPorProyecto };
