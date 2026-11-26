const { Router } = require('express');
const preguntas = require('../controllers/preguntas.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

// Con sesión: el cliente ve las activas y pide sugerencias desde el chat (RF-13).
router.use(requiereSesion);
router.get('/', preguntas.listar);
router.get('/sugerencias', preguntas.sugerencias);
router.post('/:id/resuelta', requiereRol('cliente'), preguntas.resuelta);

// Solo el personal las configura.
router.post('/', requiereRol('admin'), preguntas.crear);
router.put('/:id', requiereRol('admin'), preguntas.actualizar);
router.delete('/:id', requiereRol('admin'), preguntas.eliminar);

module.exports = router;
