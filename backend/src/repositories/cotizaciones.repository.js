const db = require('../config/db');

async function crear({ usuarioId, telefono, tipoCliente, tipoTrabajo, direccion, medidas, descripcion }, conexion) {
  const resultado = await db.consultar(
    `INSERT INTO cotizaciones (usuario_id, telefono, tipo_cliente, tipo_trabajo, direccion, medidas, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, telefono, tipoCliente, tipoTrabajo, direccion, medidas || null, descripcion],
    conexion,
  );
  return resultado.insertId;
}

async function agregarArchivo({ cotizacionId, nombreOriginal, ruta, tipoMime }, conexion) {
  await db.consultar(
    'INSERT INTO cotizacion_archivos (cotizacion_id, nombre_original, ruta, tipo_mime) VALUES (?, ?, ?, ?)',
    [cotizacionId, nombreOriginal.slice(0, 255), ruta, tipoMime],
    conexion,
  );
}

const SELECT_COTIZACION = `
  SELECT c.id, c.tipo_cliente AS tipoCliente, c.tipo_trabajo AS tipoTrabajo, c.direccion, c.medidas,
         c.descripcion, c.telefono, c.estado, c.creado_en AS creadoEn,
         u.id AS clienteId, u.nombre AS cliente, u.correo, e.nombre AS empresa,
         (SELECT COUNT(*) FROM cotizacion_archivos a WHERE a.cotizacion_id = c.id) AS archivos
    FROM cotizaciones c
    JOIN usuarios u ON u.id = c.usuario_id
    LEFT JOIN empresas e ON e.id = u.empresa_id`;

async function listarTodas() {
  return db.consultar(`${SELECT_COTIZACION} ORDER BY c.creado_en DESC, c.id DESC`);
}

async function listarDeUsuario(usuarioId) {
  return db.consultar(`${SELECT_COTIZACION} WHERE c.usuario_id = ? ORDER BY c.creado_en DESC, c.id DESC`, [usuarioId]);
}

module.exports = { crear, agregarArchivo, listarTodas, listarDeUsuario };
