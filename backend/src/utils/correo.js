// Envío de avisos por correo (contenedor «Servicio de correo», SMTP).
// Si SMTP_HOST no está configurado, no envía nada y la API sigue funcionando.
const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporte;
let avisoSinConfiguracion = false;

function obtenerTransporte() {
  if (!config.correo.host) return null;
  if (!transporte) {
    transporte = nodemailer.createTransport({
      host: config.correo.host,
      port: config.correo.port,
      secure: config.correo.port === 465,
      auth: config.correo.usuario ? { user: config.correo.usuario, pass: config.correo.contrasena } : undefined,
    });
  }
  return transporte;
}

// Nunca lanza error: un correo que falla no debe deshacer lo que ya se guardó.
async function enviar({ para, asunto, texto }) {
  const conexion = obtenerTransporte();
  if (!conexion) {
    if (!avisoSinConfiguracion && config.entorno !== 'test') {
      console.warn('[correo] SMTP_HOST no está configurado: no se envían avisos por correo.');
      avisoSinConfiguracion = true;
    }
    return false;
  }
  try {
    await conexion.sendMail({ from: config.correo.remitente || config.correo.usuario, to: para, subject: asunto, text: texto });
    return true;
  } catch (error) {
    console.error(`[correo] No se pudo enviar un aviso: ${error.code || error.message}`);
    return false;
  }
}

module.exports = { enviar };
