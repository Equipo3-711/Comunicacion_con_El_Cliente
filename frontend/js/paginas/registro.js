// Pantalla 2 · Crear cuenta. El registro es obligatorio antes de cotizar (CC-01, RF-02).
import { api } from '../api.js';
import { guardarSesion, irA } from '../sesion.js';
import { montarEncabezado, mostrarErrores, mientrasSeEnvia } from '../ui.js';

montarEncabezado();

const formulario = document.getElementById('formulario');
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(formulario));
  try {
    const sesion = await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), () => api.registrar(datos));
    guardarSesion(sesion);
    irA('cliente/proyectos.html?bienvenida=1');
  } catch (error) {
    mostrarErrores(formulario, error);
  }
});
