const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../config/db');
const usuarios = require('../repositories/usuarios.repository');
const empresas = require('../repositories/empresas.repository');
const { conflicto, sinSesion, noEncontrado } = require('../utils/errores');

const RONDAS_BCRYPT = 10;
// Mismo mensaje si falla el correo o la contraseña, para no revelar cuál fue (T-08).
const MENSAJE_LOGIN_INVALIDO = 'Correo o contraseña incorrectos.';

function firmarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol, empresaId: usuario.empresaId ?? null, nombre: usuario.nombre },
    config.jwt.secreto,
    { expiresIn: config.jwt.expiraEn },
  );
}

const publico = ({ id, nombre, correo, telefono, rol, empresaId, empresa = null }) => ({
  id, nombre, correo, telefono, rol, empresaId, empresa,
});

// El cliente crea su cuenta antes de cotizar (CC-01). Se registra con su empresa.
async function registrar({ nombre, empresa, correo, telefono, contrasena }) {
  if (await usuarios.buscarPorCorreo(correo)) {
    throw conflicto('Ya existe una cuenta con ese correo. Inicia sesión.');
  }
  const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_BCRYPT);

  const usuario = await db.transaccion(async (conexion) => {
    const empresaId = await empresas.crear(empresa, conexion);
    const id = await usuarios.crear(
      { nombre, correo, telefono, contrasenaHash, rol: 'cliente', empresaId },
      conexion,
    );
    return { id, nombre, correo, telefono, rol: 'cliente', empresaId, empresa };
  });

  return { token: firmarToken(usuario), usuario: publico(usuario) };
}

async function iniciarSesion({ correo, contrasena }) {
  const usuario = await usuarios.buscarPorCorreo(correo);
  const valida = usuario ? await bcrypt.compare(contrasena, usuario.contrasenaHash) : false;
  if (!valida) throw sinSesion(MENSAJE_LOGIN_INVALIDO);
  return { token: firmarToken(usuario), usuario: publico(usuario) };
}

async function perfil(id) {
  const usuario = await usuarios.buscarPorId(id);
  if (!usuario) throw noEncontrado('La cuenta ya no existe.');
  return publico(usuario);
}

module.exports = { registrar, iniciarSesion, perfil, firmarToken };
