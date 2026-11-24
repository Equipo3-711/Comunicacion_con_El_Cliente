// El arquitecto agrega un cliente a su cartera: crea su cuenta, su empresa y su primer proyecto,
// con él como responsable. Todo se guarda junto o no se guarda nada.
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const usuarios = require('../repositories/usuarios.repository');
const empresas = require('../repositories/empresas.repository');
const notificaciones = require('./notificaciones.service');
const { abrir } = require('./proyectos.service');
const { conflicto } = require('../utils/errores');

const RONDAS_BCRYPT = 10;

async function agregar(admin, { nombre, empresa, correo, telefono, contrasena, proyecto }) {
  if (await usuarios.buscarPorCorreo(correo)) {
    throw conflicto('Ya existe una cuenta con ese correo. Ábrele el proyecto desde «Cliente ya registrado».');
  }
  const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_BCRYPT);

  const resultado = await db.transaccion(async (conexion) => {
    const empresaId = await empresas.crear(empresa, conexion);
    const id = await usuarios.crear({ nombre, correo, telefono, contrasenaHash, rol: 'cliente', empresaId }, conexion);
    const abierto = await abrir(admin, { empresaId, ...proyecto }, conexion);
    return { cliente: { id, nombre, correo, telefono, rol: 'cliente', empresaId, empresa }, ...abierto };
  });

  notificaciones.enviarCorreos(resultado.clientes, resultado.proyecto, resultado.evento);
  return { cliente: resultado.cliente, proyecto: resultado.proyecto };
}

module.exports = { agregar };
