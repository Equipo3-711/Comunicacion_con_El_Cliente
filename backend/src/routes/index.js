const { Router } = require('express');

const router = Router();

router.get('/salud', (req, res) => {
  res.json({ ok: true, servicio: 'portal-proyectos-api' });
});

router.use('/auth', require('./auth.routes'));

module.exports = router;
