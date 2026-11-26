const { Router } = require('express');
const cotizaciones = require('../controllers/cotizaciones.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const { subidaEn, verificarContenido } = require('../utils/archivos');
const router = Router();
// Fotos o planos opcionales: hasta 5 archivos en el campo "archivos".
const subida = subidaEn('cotizaciones', { maxArchivos: 5 });

router.use(requiereSesion);
// Solo un cliente registrado puede cotizar (CC-01).
router.post('/', requiereRol('cliente'), subida.array('archivos', 5), verificarContenido, cotizaciones.crear);
router.get('/', cotizaciones.listar);
router.get('/archivos/:id/ver', cotizaciones.verArchivo);
router.get('/:id', cotizaciones.obtener);
// El cliente cambia su cotización (RF-11); se reemplazan todos los campos del formulario.
router.put('/:id', cotizaciones.modificar);
router.patch('/:id/estado', requiereRol('admin'), cotizaciones.cambiarEstado);

module.exports = router;
