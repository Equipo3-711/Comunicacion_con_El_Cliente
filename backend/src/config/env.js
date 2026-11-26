// Lee la configuración del archivo .env. Nunca imprime los valores,
// porque incluyen contraseñas y llaves (regla de seguridad de AGENTS.md).
const os = require('node:os');
const path = require('node:path');

// ENV_FILE permite usar otro archivo, por ejemplo .env.nube para cargar la base del despliegue.
const archivoEnv = process.env.ENV_FILE
  ? path.resolve(process.env.ENV_FILE)
  : path.join(__dirname, '..', '..', '.env');
require('dotenv').config({ path: archivoEnv, quiet: true });

const OBLIGATORIAS = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

// Bases en la nube (Aiven, TiDB…) piden conexión cifrada. DB_SSL_CA es el certificado
// público del proveedor; puede venir en una sola línea con \n.
function conexionCifrada() {
  if (process.env.DB_SSL !== 'true') return undefined;
  const ca = process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined;
  return { rejectUnauthorized: true, minVersion: 'TLSv1.2', ...(ca && { ca }) };
}

// En Vercel solo se puede escribir en la carpeta temporal; de ahí los archivos pasan a Vercel Blob.
function carpetaDeArchivos() {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR;
  if (process.env.VERCEL) return path.join(os.tmpdir(), 'portal-subidas');
  return path.join(__dirname, '..', '..', 'uploads');
}

const config = {
  puerto: Number(process.env.PORT) || 3000,
  entorno: process.env.NODE_ENV || 'development',
  origenesWeb: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  urlPortal: process.env.PORTAL_URL || 'http://localhost:5173/',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    ssl: conexionCifrada(),
  },
  // Zona horaria de NOW() y CURRENT_TIMESTAMP. Con Docker la pone el contenedor;
  // en una base en la nube se indica aquí (México centro: -06:00, sin horario de verano).
  zonaHorariaDb: process.env.DB_TIMEZONE || null,
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
    carpeta: carpetaDeArchivos(),
    tamanoMaximoMb: 10,
    // Con el token de Vercel Blob, fotos y documentos se guardan ahí en lugar de en la carpeta.
    enNube: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  },
};

// Devuelve solo los NOMBRES de las variables que faltan, nunca sus valores.
config.variablesFaltantes = () => OBLIGATORIAS.filter((nombre) => !process.env[nombre]);

module.exports = config;
