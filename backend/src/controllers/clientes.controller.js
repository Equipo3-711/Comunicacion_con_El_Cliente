const clientesService = require('../services/clientes.service');
const { validarNuevoCliente } = require('../validators/cliente.validator');

async function agregar(req, res) {
  const resultado = await clientesService.agregar(req.usuario, validarNuevoCliente(req.body));
  res.status(201).json(resultado);
}

module.exports = { agregar };
