const config = require('./config/env');
const { crearApp } = require('./app');

const faltantes = config.variablesFaltantes();
if (faltantes.length > 0) {
  console.error(`Faltan variables en backend/.env: ${faltantes.join(', ')}. Copia .env.example como .env y llénalo.`);
  process.exit(1);
}

crearApp().listen(config.puerto, () => {
  console.log(`API del Portal de Proyectos en http://localhost:${config.puerto}/api`);
});
