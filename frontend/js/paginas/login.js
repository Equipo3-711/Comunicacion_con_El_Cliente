// Pantalla 1 · Iniciar sesión. El rol que devuelve la API decide a qué pantalla se entra (RNF-06).
import { api } from '../api.js';
import { guardarSesion, usuarioActual, irA, inicioDe } from '../sesion.js';
import { montarEncabezado, mostrarErrores, mientrasSeEnvia, parametro } from '../ui.js';

const yaEntro = usuarioActual();
if (yaEntro) irA(inicioDe(yaEntro.rol));

montarEncabezado();
document.getElementById('expirada').hidden = parametro('expirada') !== '1';

const formulario = document.getElementById('formulario');
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = { correo: formulario.correo.value, contrasena: formulario.contrasena.value };
  try {
    const sesion = await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), () => api.iniciarSesion(datos));
    guardarSesion(sesion);
    irA(inicioDe(sesion.usuario.rol));
  } catch (error) {
    // El mismo mensaje si falla el correo o la contraseña (T-08).
    mostrarErrores(formulario, error);
  }
});
