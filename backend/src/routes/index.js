const { Router } = require('express');

const router = Router();

router.get('/salud', (req, res) => {
  res.json({ ok: true, servicio: 'portal-proyectos-api' });
});

module.exports = router;
