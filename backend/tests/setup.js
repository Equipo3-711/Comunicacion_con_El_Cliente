// Valores solo para pruebas: no son secretos reales y no sirven fuera de npm test.
const os = require('node:os');
const path = require('node:path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'solo-para-pruebas-no-usar-en-servidor';
process.env.UPLOADS_DIR = path.join(os.tmpdir(), 'portal-proyectos-pruebas');
