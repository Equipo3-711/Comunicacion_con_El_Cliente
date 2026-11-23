const { Router } = require('express');
const pendientes = require('../controllers/pendientes.controller');
const { requiereSesion } = require('../middlewares/auth');

const router = Router();
router.use(requiereSesion);

router.get('/', pendientes.listar);
router.patch('/leidos', pendientes.marcarTodos);
router.patch('/:id/leido', pendientes.marcarLeido);

module.exports = router;
