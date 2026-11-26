const { Router } = require('express');
const solicitudes = require('../controllers/solicitudes.controller');
const { requiereSesion, requiereRol } = require('../middlewares/auth');

const router = Router();

// La bandeja es solo del personal. Los clientes piden desde el portal con la cotización y el chat.
router.use(requiereSesion, requiereRol('admin'));

router.get('/', solicitudes.listar);
router.post('/', solicitudes.registrar);
router.get('/responsables', solicitudes.responsables);
router.patch('/:id', solicitudes.actualizar);

module.exports = router;
