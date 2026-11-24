// Chat del proyecto, solo para dudas (CC-04). Lo usan el cliente y el arquitecto.
// Muestra los mensajes, envía los nuevos y revisa cada pocos segundos si llegó otro.
import { api } from '../api.js';
import { escapar, hora, fechaCorta, avisar } from '../ui.js';

const CADA_CUANTO_MS = 8000;

function burbuja(mensaje, usuario) {
  const propio = mensaje.autorId === usuario.id;
  const quien = propio ? 'Tú' : mensaje.autor;
  return `<div class="b ${propio ? 'me' : ''}">
    <small>${escapar(quien)} · ${fechaCorta(mensaje.creadoEn)} ${hora(mensaje.creadoEn)}</small>${escapar(mensaje.texto)}
  </div>`;
}

// contenedor: elemento donde se dibuja. alEnviar: se llama después de mandar un mensaje.
export function montarChat({ contenedor, proyectoId, usuario, alEnviar = () => {} }) {
  contenedor.innerHTML = `
    <div class="msgs" id="mensajes" aria-live="polite"></div>
    <form class="escribir" id="formMensaje">
      <label class="ttl" for="texto" hidden>Mensaje</label>
      <input class="in" id="texto" name="texto" maxlength="1000" autocomplete="off"
        placeholder="${usuario.rol === 'cliente' ? 'Escribe tu duda…' : 'Escribe un mensaje…'}">
      <button class="btn s p" type="submit">Enviar</button>
    </form>`;

  const lista = contenedor.querySelector('#mensajes');
  const formulario = contenedor.querySelector('#formMensaje');
  let ultimoId = null;

  async function cargar() {
    const { mensajes } = await api.mensajes(proyectoId);
    const nuevoUltimo = mensajes.at(-1)?.id ?? null;
    if (nuevoUltimo === ultimoId) return;
    ultimoId = nuevoUltimo;
    lista.innerHTML = mensajes.length
      ? mensajes.map((mensaje) => burbuja(mensaje, usuario)).join('')
      : '<p class="vacio">Todavía no hay mensajes. Escribe tu duda y te responderemos aquí.</p>';
    lista.scrollTop = lista.scrollHeight;
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const texto = formulario.texto.value.trim();
    if (!texto) return;
    const boton = formulario.querySelector('button');
    boton.disabled = true;
    try {
      await api.enviarMensaje(proyectoId, texto);
      formulario.reset();
      await cargar();
      alEnviar();
    } catch (error) {
      avisar(error.message, 'error');
    } finally {
      boton.disabled = false;
      formulario.texto.focus();
    }
  });

  const revisar = setInterval(() => cargar().catch(() => {}), CADA_CUANTO_MS);
  window.addEventListener('pagehide', () => clearInterval(revisar));
  return cargar();
}
