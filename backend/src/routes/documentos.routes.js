const { Router } = require('express');
const documentos = require('../controllers/documentos.controller');
const { requiereSesion } = require('../middlewares/auth');

const router = Router();

router.get('/:id/ver', requiereSesion, documentos.ver);

module.exports = router;
