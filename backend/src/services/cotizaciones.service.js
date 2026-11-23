const db = require('../config/db');
const cotizaciones = require('../repositories/cotizaciones.repository');
const usuarios = require('../repositories/usuarios.repository');
const pendientes = require('../repositories/pendientes.repository');
const { rutaRelativa } = require('../utils/archivos');

// Guarda la cotización de un cliente registrado y avisa al personal en su campana.
async function crear(usuario, datos, archivos = []) {
  return db.transaccion(async (conexion) => {
    const id = await cotizaciones.crear({ usuarioId: usuario.id, ...datos }, conexion);

    for (const archivo of archivos) {
      await cotizaciones.agregarArchivo(
        { cotizacionId: id, nombreOriginal: archivo.originalname, ruta: rutaRelativa('cotizaciones', archivo), tipoMime: archivo.mimetype },
        conexion,
      );
    }

    const admins = await usuarios.listarAdmins(conexion);
    for (const admin of admins) {
      await pendientes.crear(
        { usuarioId: admin.id, tipo: 'cotizacion', descripcion: `Nueva cotización de ${usuario.nombre}: ${datos.tipoTrabajo}` },
        conexion,
      );
    }

    return { id, estado: 'recibida', ...datos, archivos: archivos.length };
  });
}

// El personal ve todas; cada cliente ve solo las suyas.
async function listar(usuario) {
  return usuario.rol === 'admin' ? cotizaciones.listarTodas() : cotizaciones.listarDeUsuario(usuario.id);
}

module.exports = { crear, listar };
