const mensajesService = require('../services/mensajes.service');
const { requerido, maximo, validar, texto } = require('../validators/comunes');
const { solicitudInvalida } = require('../utils/errores');

async function listar(req, res) {
  res.json({ mensajes: await mensajesService.listar(req.usuario, req.params.id) });
}

async function enviar(req, res) {
  const errores = validar(req.body, { texto: [requerido('Escribe tu duda.'), maximo(1000)] });
  if (Object.keys(errores).length > 0) throw solicitudInvalida('Revisa el mensaje.', errores);
  const mensaje = await mensajesService.enviar(req.usuario, req.params.id, texto(req.body.texto));
  res.status(201).json({ mensaje });
}

module.exports = { listar, enviar };
