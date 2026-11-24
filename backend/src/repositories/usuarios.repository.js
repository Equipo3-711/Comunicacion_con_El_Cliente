const db = require('../config/db');

// Incluye el nombre de la empresa, que la aplicación muestra junto al nombre del cliente.
const COLUMNAS_PUBLICAS = 'u.id, u.nombre, u.correo, u.telefono, u.rol, u.empresa_id AS empresaId, e.nombre AS empresa';
const DESDE_USUARIOS = 'FROM usuarios u LEFT JOIN empresas e ON e.id = u.empresa_id';

async function buscarPorCorreo(correo, conexion) {
  const filas = await db.consultar(
    `SELECT ${COLUMNAS_PUBLICAS}, u.contrasena_hash AS contrasenaHash ${DESDE_USUARIOS} WHERE u.correo = ?`,
    [correo],
    conexion,
  );
  return filas[0] || null;
}

async function buscarPorId(id, conexion) {
  const filas = await db.consultar(`SELECT ${COLUMNAS_PUBLICAS} ${DESDE_USUARIOS} WHERE u.id = ?`, [id], conexion);
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
