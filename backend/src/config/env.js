// Lee la configuración del archivo .env. Nunca imprime los valores,
// porque incluyen contraseñas y llaves (regla de seguridad de AGENTS.md).
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const OBLIGATORIAS = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

const config = {
  puerto: Number(process.env.PORT) || 3000,
  entorno: process.env.NODE_ENV || 'development',
  origenesWeb: (process.env.CORS_ORIGIN || 'http://127.0.0.1:5500')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  urlPortal: process.env.PORTAL_URL || 'http://127.0.0.1:5500/login/index.html',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  },
  jwt: {
    secreto: process.env.JWT_SECRET,
    expiraEn: process.env.JWT_EXPIRES_IN || '8h',
  },
  correo: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    usuario: process.env.SMTP_USER,
    contrasena: process.env.SMTP_PASS,
    remitente: process.env.SMTP_FROM,
  },
  archivos: {
    carpeta: process.env.UPLOADS_DIR || path.join(__dirname, '..', '..', 'uploads'),
    tamanoMaximoMb: 10,
  },
};

// Devuelve solo los NOMBRES de las variables que faltan, nunca sus valores.
config.variablesFaltantes = () => OBLIGATORIAS.filter((nombre) => !process.env[nombre]);

module.exports = config;
