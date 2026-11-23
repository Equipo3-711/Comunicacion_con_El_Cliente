// Campana de pendientes de cada usuario (RF-18, CC-08).
const pendientes = require('../repositories/pendientes.repository');
const { noEncontrado } = require('../utils/errores');

async function listar(req, res) {
  const lista = await pendientes.listarSinLeer(req.usuario.id);
  res.json({ total: lista.length, pendientes: lista });
}

async function marcarTodos(req, res) {
  res.json({ marcados: await pendientes.marcarTodosLeidos(req.usuario.id) });
}

// Al abrir un pendiente, el contador baja (criterio 2 de HU-22).
async function marcarLeido(req, res) {
  const id = Number(req.params.id);
  const cambiados = Number.isInteger(id) && id > 0 ? await pendientes.marcarLeido(id, req.usuario.id) : 0;
  if (cambiados === 0) throw noEncontrado('El pendiente no existe.');
  res.status(204).end();
}

module.exports = { listar, marcarTodos, marcarLeido };
