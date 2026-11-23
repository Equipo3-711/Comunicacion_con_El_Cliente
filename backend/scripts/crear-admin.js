// Crea una cuenta de administrador (personal de la vidriería).
// Pide los datos en la terminal para que ninguna contraseña quede escrita en el repositorio.
//   npm run crear-admin
const readline = require('node:readline');
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

  // Se leen las líneas en orden, para que funcione al escribir a mano o al recibir los datos por tubería.
  const terminal = readline.createInterface({ input: process.stdin });
  const lineas = terminal[Symbol.asyncIterator]();
  const preguntar = async (texto) => {
    process.stdout.write(texto);
    const { value } = await lineas.next();
    return value ?? '';
  };
  const nombre = (await preguntar('Nombre del administrador: ')).trim();
  const correo = (await preguntar('Correo: ')).trim().toLowerCase();
  const contrasena = await preguntar('Contraseña (mínimo 8 caracteres): ');
  terminal.close();
  process.stdout.write('\n');

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
