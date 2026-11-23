const { Router } = require('express');
const auth = require('../controllers/auth.controller');
const { requiereSesion } = require('../middlewares/auth');

const router = Router();

router.post('/registro', auth.registrar);
router.post('/login', auth.iniciarSesion);
router.get('/yo', requiereSesion, auth.yo);

module.exports = router;
