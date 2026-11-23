const { Router } = require('express');
const cotizaciones = require('../controllers/cotizaciones.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');
const { subidaEn } = require('../utils/archivos');

const router = Router();
// Fotos o planos opcionales: hasta 5 archivos en el campo "archivos".
const subida = subidaEn('cotizaciones', { maxArchivos: 5 });

router.use(requiereSesion);
// Solo un cliente registrado puede cotizar (CC-01).
router.post('/', requiereRol('cliente'), subida.array('archivos', 5), cotizaciones.crear);
router.get('/', cotizaciones.listar);

module.exports = router;
