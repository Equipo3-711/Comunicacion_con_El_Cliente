/// <reference types="vitest/config" />
// Configuración de Vite (servidor de desarrollo y build) y de Vitest (pruebas del front).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, las peticiones a /api se pasan a la API (backend/). Así el navegador
// solo habla con un origen y no hace falta configurar CORS para probar en la computadora.
const API_LOCAL = process.env.VITE_API_PROXY || 'http://localhost:3000';
const proxy = { '/api': { target: API_LOCAL, changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  // RNF-05: navegadores de Android 10 o superior e iOS 15 o superior.
  // El aviso de tamaño se sube por el trabajador de pdf.js, que solo se descarga al abrir un PDF.
  build: { target: ['es2020', 'safari15', 'ios15', 'chrome87', 'edge88', 'firefox78'], chunkSizeWarningLimit: 1400 },
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 4173, strictPort: true, proxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/pruebas/preparar.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
