// Pantalla 11 · Chat del arquitecto con el cliente, con el semáforo de atención.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import { montarEncabezado, iniciales, parametro, avisar, errorAlCargar, ATENCION } from '../ui.js';
import { montarChat } from '../componentes/chat.js';

const usuario = exigirSesion('admin');
montarEncabezado(usuario);
const id = parametro('id');
const botones = document.querySelectorAll('[data-atencion]');

function marcarEstado(atencion) {
  botones.forEach((boton) => boton.setAttribute('aria-pressed', String(boton.dataset.atencion === atencion)));
}

// Después de responder, el semáforo pudo cambiar solo: se vuelve a leer.
async function refrescarEstado() {
  const { proyecto } = await api.proyecto(id);
  marcarEstado(proyecto.atencion);
  return proyecto;
}

botones.forEach((boton) => boton.addEventListener('click', async () => {
  try {
    await api.cambiarAtencion(id, boton.dataset.atencion);
    marcarEstado(boton.dataset.atencion);
    avisar(`Marcado como «${ATENCION[boton.dataset.atencion]}».`);
  } catch (error) {
    avisar(error.message, 'error');
  }
}));

try {
  const [proyecto, { proyectos }] = await Promise.all([refrescarEstado(), api.proyectos()]);
  const cliente = proyectos.find((registro) => String(registro.id) === id)?.cliente || proyecto.empresa;
  document.title = `Chat con ${cliente} · T Efficiency`;
  document.getElementById('iniciales').textContent = iniciales(cliente);
  document.getElementById('cliente').textContent = cliente;
  document.getElementById('proyecto').textContent = `Proyecto #${proyecto.id} · ${proyecto.nombre}`;
  document.getElementById('detalles').href = `proyecto.html?id=${id}`;
  await montarChat({
    contenedor: document.getElementById('chat'),
    proyectoId: id,
    usuario,
    alEnviar: () => refrescarEstado().catch(() => {}),
  });
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
