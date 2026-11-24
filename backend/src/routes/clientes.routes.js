const { Router } = require('express');
const clientes = require('../controllers/clientes.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(requiereSesion, requiereRol('admin'));

// Lista de clientes con su empresa, para registrar una solicitud a su nombre.
router.get('/', clientes.listar);
// Botón «Agregar usuario» del arquitecto: alta del cliente con su primer proyecto (RF-02).
router.post('/', clientes.agregar);

module.exports = router;
