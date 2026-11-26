// Se corre antes de cada archivo de pruebas (vite.config.ts).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom no trae showModal ni close de <dialog>.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.open = true; };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}
Element.prototype.scrollIntoView = vi.fn();

// Node 25 trae su propio localStorage y, sin --localstorage-file, ese objeto no tiene métodos.
// La aplicación solo usa sessionStorage; localStorage se limpia solo si de verdad se puede.
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  if (typeof globalThis.localStorage?.clear === 'function') localStorage.clear();
  vi.restoreAllMocks();
});
