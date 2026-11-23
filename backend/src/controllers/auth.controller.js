const authService = require('../services/auth.service');
const { validarRegistro, validarLogin } = require('../validators/auth.validator');

async function registrar(req, res) {
  const resultado = await authService.registrar(validarRegistro(req.body));
  res.status(201).json(resultado);
}

async function iniciarSesion(req, res) {
  res.json(await authService.iniciarSesion(validarLogin(req.body)));
}

async function yo(req, res) {
  res.json({ usuario: await authService.perfil(req.usuario.id) });
}

module.exports = { registrar, iniciarSesion, yo };
