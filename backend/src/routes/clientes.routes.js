const { Router } = require('express');
const clientes = require('../controllers/clientes.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

// Botón «Agregar usuario» del arquitecto: alta del cliente con su primer proyecto (RF-02).
router.post('/', requiereSesion, requiereRol('admin'), clientes.agregar);

module.exports = router;
