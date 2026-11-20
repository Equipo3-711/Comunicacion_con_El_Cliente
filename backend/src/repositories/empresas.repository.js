const db = require('../config/db');

async function crear(nombre, conexion) {
  const resultado = await db.consultar('INSERT INTO empresas (nombre) VALUES (?)', [nombre], conexion);
  return resultado.insertId;
}

async function buscarPorId(id, conexion) {
  const filas = await db.consultar('SELECT id, nombre FROM empresas WHERE id = ?', [id], conexion);
  return filas[0] || null;
}

async function listar() {
  return db.consultar('SELECT id, nombre, creado_en AS creadoEn FROM empresas ORDER BY nombre');
}

module.exports = { crear, buscarPorId, listar };
