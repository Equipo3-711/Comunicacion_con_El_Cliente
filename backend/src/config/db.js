// Conexión a MySQL. Los repositorios son los únicos que usan este módulo.
const mysql = require('mysql2/promise');
const config = require('./env');

let pool;

function obtenerPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...config.db,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
      decimalNumbers: true,
      charset: 'utf8mb4',
    });
    if (config.zonaHorariaDb) usarZonaHoraria(pool, config.zonaHorariaDb);
  }
  return pool;
}

// Cada conexión nueva queda en la hora de México antes de su primera consulta.
function usarZonaHoraria(conjunto, zona) {
  conjunto.pool.on('connection', (conexion) => {
    conexion.query('SET time_zone = ?', [zona], (error) => {
      if (error) console.error(`[db] No se pudo fijar la zona horaria: ${error.code || error.message}`);
    });
  });
}

// Ejecuta una consulta. Si recibe una conexión, la usa (para transacciones).
async function consultar(sql, parametros = [], conexion = null) {
  const [resultado] = await (conexion || obtenerPool()).execute(sql, parametros);
  return resultado;
}

// Ejecuta varias consultas que se guardan juntas o no se guarda ninguna.
async function transaccion(trabajo) {
  const conexion = await obtenerPool().getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

async function cerrar() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = { consultar, transaccion, cerrar };
