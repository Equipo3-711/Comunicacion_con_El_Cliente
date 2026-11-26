// Pruebas de flujos completos con Cypress (docs/ACUERDOS.md, definición de terminado).
// Corren contra `npm run dev`; las respuestas de la API se simulan con cypress/fixtures.
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
  },
});
