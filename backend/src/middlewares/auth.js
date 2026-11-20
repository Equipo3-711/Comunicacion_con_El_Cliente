const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { sinSesion, sinPermiso } = require('../utils/errores');

// Exige un token válido en el encabezado Authorization: Bearer <token> (RNF-06).
function requiereSesion(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return next(sinSesion());
  try {
    const datos = jwt.verify(token, config.jwt.secreto);
    req.usuario = { id: Number(datos.sub), rol: datos.rol, empresaId: datos.empresaId ?? null, nombre: datos.nombre };
    return next();
  } catch {
    return next(sinSesion('Tu sesión expiró o no es válida. Inicia sesión de nuevo.'));
  }
}

// Deja pasar solo a los roles indicados: 'admin' o 'cliente'.
function requiereRol(...roles) {
  return (req, res, next) => (roles.includes(req.usuario?.rol) ? next() : next(sinPermiso()));
}

module.exports = { requiereSesion, requiereRol };
