const { Router } = require('express');
const proyectos = require('../controllers/proyectos.controller');
const seguimiento = require('../controllers/seguimiento.controller');
const documentos = require('../controllers/documentos.controller');
const mensajes = require('../controllers/mensajes.controller');
const { subidaEn } = require('../utils/archivos');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();
const soloAdmin = requiereRol('admin');

router.use(requiereSesion);

router.get('/', proyectos.listar);
router.post('/', soloAdmin, proyectos.crear);
router.get('/:id', proyectos.obtener);
router.patch('/:id', soloAdmin, proyectos.actualizarDatos);
router.patch('/:id/estado', soloAdmin, proyectos.cambiarEstado);
router.patch('/:id/atencion', soloAdmin, proyectos.cambiarAtencion);
router.get('/:id/historial', proyectos.historial);

router.post('/:id/actualizaciones', soloAdmin, seguimiento.registrarActualizacion);
router.get('/:id/actividades', seguimiento.listarActividades);
router.post('/:id/actividades', soloAdmin, seguimiento.crearActividad);

router.get('/:id/documentos', documentos.listar);
router.post('/:id/documentos', soloAdmin, subidaEn('documentos').single('archivo'), documentos.subir);

router.get('/:id/mensajes', mensajes.listar);
router.post('/:id/mensajes', mensajes.enviar);

module.exports = router;
