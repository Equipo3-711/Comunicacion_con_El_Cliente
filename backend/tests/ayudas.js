// Utilidades compartidas por las pruebas.
const jwt = require('jsonwebtoken');

function tokenDe(usuario) {
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol, empresaId: usuario.empresaId ?? null, nombre: usuario.nombre || 'Prueba' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
}

const ADMIN = { id: 1, rol: 'admin', empresaId: null, nombre: 'Arq. Laura Méndez' };
const CLIENTE = { id: 2, rol: 'cliente', empresaId: 10, nombre: 'Marcos Ruiz' };
const OTRO_CLIENTE = { id: 3, rol: 'cliente', empresaId: 20, nombre: 'Ana Torres' };

const bearer = (usuario) => `Bearer ${tokenDe(usuario)}`;

module.exports = { tokenDe, bearer, ADMIN, CLIENTE, OTRO_CLIENTE };
