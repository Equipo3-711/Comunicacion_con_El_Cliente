// Campana de pendientes de cada usuario (RF-18, CC-08).
const { Router } = require('express');
const pendientes = require('../repositories/pendientes.repository');
const { requiereSesion } = require('../middlewares/auth');
const { noEncontrado } = require('../utils/errores');

const router = Router();
router.use(requiereSesion);

router.get('/', async (req, res) => {
  const lista = await pendientes.listarSinLeer(req.usuario.id);
  res.json({ total: lista.length, pendientes: lista });
});

router.patch('/leidos', async (req, res) => {
  res.json({ marcados: await pendientes.marcarTodosLeidos(req.usuario.id) });
});

// Al abrir un pendiente, el contador baja (criterio 2 de HU-22).
router.patch('/:id/leido', async (req, res) => {
  const id = Number(req.params.id);
  const cambiados = Number.isInteger(id) && id > 0 ? await pendientes.marcarLeido(id, req.usuario.id) : 0;
  if (cambiados === 0) throw noEncontrado('El pendiente no existe.');
  res.status(204).end();
});

module.exports = router;
