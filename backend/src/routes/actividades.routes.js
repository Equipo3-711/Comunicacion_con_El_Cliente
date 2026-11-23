const { Router } = require('express');
const seguimiento = require('../controllers/seguimiento.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

// Botón «Marcar como realizada» del arquitecto (RF-17).
router.patch('/:id/realizada', requiereSesion, requiereRol('admin'), seguimiento.marcarRealizada);

module.exports = router;
