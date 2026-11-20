const { Router } = require('express');
const empresas = require('../repositories/empresas.repository');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

// Lista de empresas para que el personal elija a cuál pertenece un proyecto nuevo.
router.get('/', requiereSesion, requiereRol('admin'), async (req, res) => {
  res.json({ empresas: await empresas.listar() });
});

module.exports = router;
