const { Router } = require('express');
const empresas = require('../controllers/empresas.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

router.get('/', requiereSesion, requiereRol('admin'), empresas.listar);

module.exports = router;
