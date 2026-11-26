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
          c.descripcion, c.telefono, c.estado, c.proyecto_id AS proyectoId,
          c.creado_en AS creadoEn, c.modificada_en AS modificadaEn,
          u.id AS clienteId, u.nombre AS cliente, u.correo, u.empresa_id AS empresaId, e.nombre AS empresa,
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

async function buscarPorId(id, conexion) {
  const filas = await db.consultar(`${SELECT_COTIZACION} WHERE c.id = ?`, [id], conexion);
  return filas[0] || null;
}

// Cambio que pidió el cliente (RF-11): se reemplazan los datos del formulario y se anota cuándo.
async function modificar(id, { telefono, tipoCliente, tipoTrabajo, direccion, medidas, descripcion }, conexion) {
  await db.consultar(
    `UPDATE cotizaciones
        SET telefono = ?, tipo_cliente = ?, tipo_trabajo = ?, direccion = ?, medidas = ?, descripcion = ?,
            modificada_en = NOW()
      WHERE id = ?`,
    [telefono, tipoCliente, tipoTrabajo, direccion, medidas || null, descripcion, id],
    conexion,
  );
}

async function cambiarEstado(id, estado, conexion) {
  await db.consultar('UPDATE cotizaciones SET estado = ? WHERE id = ?', [estado, id], conexion);
}

async function ligarProyecto(id, proyectoId, conexion) {
  await db.consultar('UPDATE cotizaciones SET proyecto_id = ? WHERE id = ?', [proyectoId, id], conexion);
}

async function listarArchivos(cotizacionId) {
  return db.consultar(
    `SELECT id, nombre_original AS nombre, tipo_mime AS tipoMime, creado_en AS creadoEn
        FROM cotizacion_archivos WHERE cotizacion_id = ? ORDER BY id`,
    [cotizacionId],
  );
}

async function buscarArchivo(id) {
  const filas = await db.consultar(
    `SELECT id, cotizacion_id AS cotizacionId, nombre_original AS nombre, ruta, tipo_mime AS tipoMime
        FROM cotizacion_archivos WHERE id = ?`,
    [id],
  );
  return filas[0] || null;
}

module.exports = {
  crear, agregarArchivo, listarTodas, listarDeUsuario, buscarPorId, modificar, cambiarEstado, ligarProyecto,
  listarArchivos, buscarArchivo,
};
