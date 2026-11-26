// Carga database/schema.sql en una base que no es la de Docker, por ejemplo la del despliegue.
// Con Docker no hace falta: el contenedor lo carga solo la primera vez.
// Borra y vuelve a crear todas las tablas, así que antes pide escribir el nombre de la base.
//   ENV_FILE=.env.nube node scripts/cargar-esquema.js
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const mysql = require('mysql2/promise');
const config = require('../src/config/env');

async function confirmar() {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  const respuesta = await terminal.question(
    `Esto borra todas las tablas de la base «${config.db.database}». Escribe su nombre para seguir: `,
  );
  terminal.close();
  return respuesta.trim() === config.db.database;
}

async function main() {
  const faltantes = config.variablesFaltantes();
  if (faltantes.length > 0) throw new Error(`Faltan variables: ${faltantes.join(', ')}.`);
  if (!(await confirmar())) {
    console.log('No se cambió nada.');
    return;
  }

  const esquema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  const conexion = await mysql.createConnection({ ...config.db, multipleStatements: true, charset: 'utf8mb4' });
  try {
    await conexion.query(esquema);
  } finally {
    await conexion.end();
  }
  console.log('Listo: tablas creadas. Ahora puedes cargar los datos de prueba (scripts/datos-prueba.js).');
}

main().catch((error) => {
  // Solo el código o el mensaje del error: nunca la configuración, que trae contraseñas.
  console.error(`No se pudo cargar el esquema: ${error.code || error.message}`);
  process.exit(1);
});
