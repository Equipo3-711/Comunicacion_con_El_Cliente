const db = require('../config/db');

const SELECT_PREGUNTA = `
  SELECT id, pregunta, respuesta, palabras_clave AS palabrasClave, activa = 1 AS activa, resueltas,
          creado_en AS creadoEn, actualizado_en AS actualizadoEn
    FROM preguntas_frecuentes`;

// Las activas primero; dentro de cada grupo, las que más dudas han resuelto.
async function listar({ soloActivas = false } = {}) {
  const filtro = soloActivas ? ' WHERE activa = 1' : '';
  const filas = await db.consultar(`${SELECT_PREGUNTA}${filtro} ORDER BY activa DESC, resueltas DESC, id`);
  return filas.map((fila) => ({ ...fila, activa: Boolean(fila.activa) }));
}

async function buscarPorId(id) {
  const filas = await db.consultar(`${SELECT_PREGUNTA} WHERE id = ?`, [id]);
  return filas[0] ? { ...filas[0], activa: Boolean(filas[0].activa) } : null;
}

async function crear({ pregunta, respuesta, palabrasClave, activa }, creadaPor) {
  const resultado = await db.consultar(
    `INSERT INTO preguntas_frecuentes (pregunta, respuesta, palabras_clave, activa, creada_por)
      VALUES (?, ?, ?, ?, ?)`,
    [pregunta, respuesta, palabrasClave, activa, creadaPor],
  );
  return resultado.insertId;
}

async function actualizar(id, { pregunta, respuesta, palabrasClave, activa }) {
  await db.consultar(
    `UPDATE preguntas_frecuentes
        SET pregunta = ?, respuesta = ?, palabras_clave = ?, activa = ?, actualizado_en = NOW()
      WHERE id = ?`,
    [pregunta, respuesta, palabrasClave, activa, id],
  );
}

async function eliminar(id) {
  await db.consultar('DELETE FROM preguntas_frecuentes WHERE id = ?', [id]);
}

// El cliente contestó «Sí, esto responde mi duda».
async function sumarResuelta(id) {
  const resultado = await db.consultar('UPDATE preguntas_frecuentes SET resueltas = resueltas + 1 WHERE id = ? AND activa = 1', [id]);
  return resultado.affectedRows;
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar, sumarResuelta };
