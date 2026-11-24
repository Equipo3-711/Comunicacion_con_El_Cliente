// Historial del proyecto: lo que ha sucedido, con tipo, fecha, responsable y fotos (RF-06, RF-07, RF-16).
import { api } from '../api.js';
import { escapar, fechaCorta, TIPOS_EVENTO, urlDeArchivo, ampliarFoto } from '../ui.js';

function evento(registro) {
  const fotos = registro.fotos?.length
    ? `<div class="fotos">${registro.fotos.map((id) => `
        <button class="foto-mini" type="button" data-foto="${id}" aria-label="Ampliar foto del avance"><img alt=""></button>`).join('')}
      </div>`
    : '';
  return `<div class="ti">
    <b>${escapar(TIPOS_EVENTO[registro.tipo] || registro.tipo)}</b>
    <span>${escapar(registro.descripcion)}</span>
    <small>${fechaCorta(registro.fecha)} · ${escapar(registro.responsable)}</small>
    ${fotos}
  </div>`;
}

// Las fotos se piden con la sesión y se muestran sin enlace de descarga.
function cargarFotos(contenedor) {
  contenedor.querySelectorAll('[data-foto]').forEach(async (boton) => {
    try {
      const src = await urlDeArchivo(() => api.verFoto(boton.dataset.foto));
      boton.querySelector('img').src = src;
      boton.addEventListener('click', () => ampliarFoto(src));
    } catch {
      boton.hidden = true;
    }
  });
}

export async function montarHistorial(contenedor, proyectoId) {
  const { historial } = await api.historial(proyectoId);
  contenedor.innerHTML = historial.length
    ? historial.map(evento).join('')
    : '<p class="vacio">Todavía no hay movimientos en este proyecto.</p>';
  cargarFotos(contenedor);
}
