const { Router } = require('express');
const seguimiento = require('../controllers/seguimiento.controller');
const { requiereSesion } = require('../middlewares/auth');

const router = Router();

// Fotos de los avances: se ven dentro del portal, solo si el usuario puede ver el proyecto (RF-07).
router.get('/:id/ver', requiereSesion, seguimiento.verFoto);

module.exports = router;
