// Crea una cuenta de administrador (personal de la vidriería).
// Pide los datos en la terminal para que ninguna contraseña quede escrita en el repositorio.
//   npm run crear-admin
const readline = require('node:readline/promises');
const bcrypt = require('bcryptjs');
const config = require('../src/config/env');
const db = require('../src/config/db');
const usuarios = require('../src/repositories/usuarios.repository');

async function main() {
  const faltantes = config.variablesFaltantes();
  if (faltantes.length > 0) {
    console.error(`Faltan variables en backend/.env: ${faltantes.join(', ')}.`);
    process.exit(1);
  }

  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  const nombre = (await terminal.question('Nombre del administrador: ')).trim();
  const correo = (await terminal.question('Correo: ')).trim().toLowerCase();
  const contrasena = await terminal.question('Contraseña (mínimo 8 caracteres): ');
  terminal.close();

  if (!nombre || !correo.includes('@') || contrasena.length < 8) {
    console.error('Datos incompletos: escribe nombre, un correo válido y una contraseña de al menos 8 caracteres.');
    process.exit(1);
  }

  try {
    if (await usuarios.buscarPorCorreo(correo)) {
      console.error('Ya existe una cuenta con ese correo.');
      process.exitCode = 1;
      return;
    }
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const id = await usuarios.crear({ nombre, correo, contrasenaHash, rol: 'admin' });
    console.log(`Administrador creado con el id ${id}. Ya puede iniciar sesión.`);
  } finally {
    await db.cerrar();
  }
}

main().catch((error) => {
  console.error(`No se pudo crear el administrador: ${error.message}`);
  process.exit(1);
});
