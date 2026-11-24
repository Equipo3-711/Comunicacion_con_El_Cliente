const db = require('../config/db');

// Incluye el semáforo de atención y el contacto principal de la empresa (el primer cliente registrado).
const SELECT_RESUMEN = `
  SELECT p.id, p.nombre, p.tipo_trabajo AS tipoTrabajo, p.estado, p.atencion, p.empresa_id AS empresaId, e.nombre AS empresa,
          (SELECT u.nombre FROM usuarios u WHERE u.empresa_id = p.empresa_id AND u.rol = 'cliente' ORDER BY u.id LIMIT 1)
            AS cliente,
          COALESCE((SELECT MAX(a.creado_en) FROM actualizaciones a WHERE a.proyecto_id = p.id), p.creado_en)
            AS ultimaActualizacion
    FROM proyectos p
    JOIN empresas e ON e.id = p.empresa_id`;

async function listarTodos() {
  return db.consultar(`${SELECT_RESUMEN} ORDER BY ultimaActualizacion DESC, p.id DESC`);
}

async function listarDeEmpresa(empresaId) {
  return db.consultar(`${SELECT_RESUMEN} WHERE p.empresa_id = ? ORDER BY ultimaActualizacion DESC, p.id DESC`, [empresaId]);
}

async function buscarPorId(id, conexion) {
  const filas = await db.consultar(
    `SELECT p.id, p.nombre, p.tipo_trabajo AS tipoTrabajo, p.estado, p.atencion, p.empresa_id AS empresaId, e.nombre AS empresa,
            p.presupuesto, p.pagado, p.garantia_hasta AS garantiaHasta, p.notas_internas AS notasInternas,
            p.responsable_id AS responsableId, u.nombre AS responsable, p.creado_en AS creadoEn
        FROM proyectos p
        JOIN empresas e ON e.id = p.empresa_id
        JOIN usuarios u ON u.id = p.responsable_id
      WHERE p.id = ?`,
    [id],
    conexion,
  );
  return filas[0] || null;
}

async function crear({ empresaId, nombre, tipoTrabajo, responsableId, presupuesto, garantiaHasta, notasInternas }, conexion) {
  const resultado = await db.consultar(
    `INSERT INTO proyectos (empresa_id, nombre, tipo_trabajo, responsable_id, presupuesto, garantia_hasta, notas_internas)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [empresaId, nombre, tipoTrabajo, responsableId, presupuesto ?? null, garantiaHasta ?? null, notasInternas ?? null],
    conexion,
  );
  return resultado.insertId;
}

async function actualizarEstado(id, estado, conexion) {
  await db.consultar('UPDATE proyectos SET estado = ? WHERE id = ?', [estado, id], conexion);
}

async function actualizarAtencion(id, atencion, conexion) {
  await db.consultar('UPDATE proyectos SET atencion = ? WHERE id = ?', [atencion, id], conexion);
}

// Solo estas columnas se pueden cambiar desde la API.
const COLUMNAS_EDITABLES = {
  presupuesto: 'presupuesto',
  pagado: 'pagado',
  garantiaHasta: 'garantia_hasta',
  notasInternas: 'notas_internas',
};

async function actualizarDatos(id, campos) {
  const nombres = Object.keys(campos).filter((campo) => COLUMNAS_EDITABLES[campo]);
  if (nombres.length === 0) return;
  const asignaciones = nombres.map((campo) => `${COLUMNAS_EDITABLES[campo]} = ?`).join(', ');
  await db.consultar(`UPDATE proyectos SET ${asignaciones} WHERE id = ?`, [...nombres.map((campo) => campos[campo]), id]);
}

module.exports = {
  listarTodos, listarDeEmpresa, buscarPorId, crear, actualizarEstado, actualizarAtencion, actualizarDatos,
};
