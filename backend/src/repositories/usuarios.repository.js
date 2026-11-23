const db = require('../config/db');

const COLUMNAS_PUBLICAS = 'id, nombre, correo, telefono, rol, empresa_id AS empresaId';

async function buscarPorCorreo(correo, conexion) {
  const filas = await db.consultar(
    `SELECT ${COLUMNAS_PUBLICAS}, contrasena_hash AS contrasenaHash FROM usuarios WHERE correo = ?`,
    [correo],
    conexion,
  );
  return filas[0] || null;
}

async function buscarPorId(id, conexion) {
  const filas = await db.consultar(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`, [id], conexion);
  return filas[0] || null;
}

async function crear({ nombre, correo, telefono, contrasenaHash, rol, empresaId }, conexion) {
  const resultado = await db.consultar(
    'INSERT INTO usuarios (nombre, correo, telefono, contrasena_hash, rol, empresa_id) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, correo, telefono || null, contrasenaHash, rol, empresaId || null],
    conexion,
  );
  return resultado.insertId;
}

async function listarClientesDeEmpresa(empresaId, conexion) {
  return db.consultar(
    "SELECT id, nombre, correo FROM usuarios WHERE rol = 'cliente' AND empresa_id = ?",
    [empresaId],
    conexion,
  );
}

async function listarAdmins(conexion) {
  return db.consultar("SELECT id, nombre, correo FROM usuarios WHERE rol = 'admin'", [], conexion);
}

module.exports = { buscarPorCorreo, buscarPorId, crear, listarClientesDeEmpresa, listarAdmins };
