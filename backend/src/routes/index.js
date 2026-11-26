const { Router } = require('express');

const router = Router();

router.get('/salud', (req, res) => {
  res.json({ ok: true, servicio: 'portal-proyectos-api' });
});

router.use('/auth', require('./auth.routes'));
router.use('/cotizaciones', require('./cotizaciones.routes'));
router.use('/solicitudes', require('./solicitudes.routes'));
router.use('/empresas', require('./empresas.routes'));
router.use('/clientes', require('./clientes.routes'));
router.use('/proyectos', require('./proyectos.routes'));
router.use('/actividades', require('./actividades.routes'));
router.use('/documentos', require('./documentos.routes'));
router.use('/fotos', require('./fotos.routes'));
router.use('/pendientes', require('./pendientes.routes'));

module.exports = router;
