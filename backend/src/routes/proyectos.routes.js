const { Router } = require('express');
const proyectos = require('../controllers/proyectos.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();
const soloAdmin = requiereRol('admin');

router.use(requiereSesion);

router.get('/', proyectos.listar);
router.post('/', soloAdmin, proyectos.crear);
router.get('/:id', proyectos.obtener);
router.patch('/:id', soloAdmin, proyectos.actualizarDatos);
router.patch('/:id/estado', soloAdmin, proyectos.cambiarEstado);
router.get('/:id/historial', proyectos.historial);

module.exports = router;
