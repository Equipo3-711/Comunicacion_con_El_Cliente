const empresas = require('../repositories/empresas.repository');

// Lista de empresas para que el personal elija a cuál pertenece un proyecto nuevo.
async function listar(req, res) {
  res.json({ empresas: await empresas.listar() });
}

module.exports = { listar };
