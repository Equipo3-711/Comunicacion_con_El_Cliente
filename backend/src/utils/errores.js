// Error con código HTTP y un mensaje que se puede mostrar al usuario.
class ErrorHttp extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;
    this.detalles = detalles;
  }
}

const solicitudInvalida = (mensaje, detalles) => new ErrorHttp(400, mensaje, detalles);
const sinSesion = (mensaje = 'Inicia sesión para continuar.') => new ErrorHttp(401, mensaje);
const sinPermiso = (mensaje = 'No tienes permiso para esta acción.') => new ErrorHttp(403, mensaje);
const noEncontrado = (mensaje = 'No se encontró lo que buscas.') => new ErrorHttp(404, mensaje);
const conflicto = (mensaje) => new ErrorHttp(409, mensaje);

module.exports = { ErrorHttp, solicitudInvalida, sinSesion, sinPermiso, noEncontrado, conflicto };
