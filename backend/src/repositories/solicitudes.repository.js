const db = require('../config/db');

// Trae quién pidió (cliente con cuenta o contacto sin cuenta), su empresa, el proyecto y el responsable.
const SELECT_SOLICITUD = `
  SELECT s.id, s.canal, s.categoria, s.estado, s.descripcion,
          s.cliente_id AS clienteId, COALESCE(c.nombre, s.contacto_nombre) AS contacto,
          COALESCE(c.telefono, s.contacto_telefono) AS telefono, c.correo, e.nombre AS empresa,
          s.proyecto_id AS proyectoId, p.nombre AS proyecto, s.cotizacion_id AS cotizacionId,
          s.responsable_id AS responsableId, r.nombre AS responsable,
          s.registrada_por AS registradaPorId, rp.nombre AS registradaPor,
          s.creado_en AS creadoEn, s.atendida_en AS atendidaEn
    FROM solicitudes s
    LEFT JOIN usuarios c ON c.id = s.cliente_id
    LEFT JOIN empresas e ON e.id = c.empresa_id
    LEFT JOIN proyectos p ON p.id = s.proyecto_id
    LEFT JOIN usuarios r ON r.id = s.responsable_id
    JOIN usuarios rp ON rp.id = s.registrada_por`;

async function crear(datos, conexion) {
  const resultado = await db.consultar(
    `INSERT INTO solicitudes (canal, categoria, descripcion, cliente_id, contacto_nombre, contacto_telefono,
                              proyecto_id, cotizacion_id, responsable_id, registrada_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.canal, datos.categoria, datos.descripcion.slice(0, 1000), datos.clienteId ?? null,
      datos.contactoNombre ?? null, datos.contactoTelefono ?? null, datos.proyectoId ?? null,
      datos.cotizacionId ?? null, datos.responsableId ?? null, datos.registradaPor,
    ],
    conexion,
  );
  return resultado.insertId;
}

async function buscarPorId(id, conexion) {
  const filas = await db.consultar(`${SELECT_SOLICITUD} WHERE s.id = ?`, [id], conexion);
  return filas[0] || null;
}

// Cada filtro se traduce a una condición fija; su valor va siempre como parámetro.
const CONDICIONES = {
  canal: 's.canal = ?',
  categoria: 's.categoria = ?',
  estado: 's.estado = ?',
  responsableId: 's.responsable_id = ?',
};

async function listar(filtros = {}) {
  const usados = Object.keys(CONDICIONES).filter((campo) => filtros[campo]);
  const condiciones = usados.map((campo) => CONDICIONES[campo]);
  if (filtros.sinAsignar) condiciones.push('s.responsable_id IS NULL');
  const valores = usados.map((campo) => filtros[campo]);
  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  // Primero las que faltan por atender; dentro de cada estado, las más recientes.
  return db.consultar(
    `${SELECT_SOLICITUD} ${donde}
      ORDER BY FIELD(s.estado, 'nueva', 'en_atencion', 'atendida'), s.creado_en DESC, s.id DESC`,
    valores,
  );
}

// Solo cambia las columnas permitidas. atendida_en se llena al atenderla y se borra si se reabre.
async function actualizar(id, { categoria, estado, responsableId }, conexion) {
  const columnas = [];
  const valores = [];
  if (categoria) {
    columnas.push('categoria = ?');
    valores.push(categoria);
  }
  if (responsableId) {
    columnas.push('responsable_id = ?');
    valores.push(responsableId);
  }
  if (estado) {
    columnas.push('estado = ?', "atendida_en = IF(? = 'atendida', COALESCE(atendida_en, NOW()), NULL)");
    valores.push(estado, estado);
  }
  await db.consultar(`UPDATE solicitudes SET ${columnas.join(', ')} WHERE id = ?`, [...valores, id], conexion);
}

// Cuando se abre un proyecto a partir de una cotización, sus solicitudes quedan ligadas a ese proyecto.
async function ligarProyectoPorCotizacion(cotizacionId, proyectoId, conexion) {
  await db.consultar(
    'UPDATE solicitudes SET proyecto_id = ? WHERE cotizacion_id = ? AND proyecto_id IS NULL',
    [proyectoId, cotizacionId],
    conexion,
  );
}

// Al enviar la cotización al cliente, sus solicitudes quedan atendidas.
async function atenderPorCotizacion(cotizacionId, conexion) {
  await db.consultar(
    `UPDATE solicitudes SET estado = 'atendida', atendida_en = COALESCE(atendida_en, NOW())
      WHERE cotizacion_id = ? AND estado <> 'atendida'`,
    [cotizacionId],
    conexion,
  );
}

// Responsable de la solicitud original de una cotización, para avisarle de una modificación.
async function responsableDeCotizacion(cotizacionId, conexion) {
  const filas = await db.consultar(
    `SELECT responsable_id AS responsableId FROM solicitudes
      WHERE cotizacion_id = ? AND categoria = 'cotizacion' AND responsable_id IS NOT NULL
      ORDER BY id LIMIT 1`,
    [cotizacionId],
    conexion,
  );
  return filas[0]?.responsableId ?? null;
}

module.exports = {
  crear, buscarPorId, listar, actualizar, ligarProyectoPorCotizacion, atenderPorCotizacion, responsableDeCotizacion,
};
