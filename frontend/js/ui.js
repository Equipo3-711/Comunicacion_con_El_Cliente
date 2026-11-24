// Piezas de interfaz que comparten todas las pantallas: encabezado con campana, tema,
// formatos de fecha y dinero, avisos y errores de formulario.
import { api } from './api.js';
import { cerrarSesion, irA, enlace, inicioDe } from './sesion.js';

// ---------- Textos ----------

export const ESTADOS = {
  cotizacion: 'En cotización',
  en_proceso: 'En proceso',
  en_instalacion: 'En instalación',
  terminado: 'Terminado',
};
export const ATENCION = { no_atendido: 'No atendido', pendiente: 'Pendiente', atendido: 'Atendido' };
export const TIPOS_EVENTO = { avance: 'Avance', cambio_estado: 'Cambio de estado', documento: 'Documento', solicitud: 'Solicitud' };
export const TIPOS_TRABAJO = { ventanas: 'Ventanas', fachada: 'Fachada', canceles: 'Canceles', barandales: 'Barandales' };
export const TIPOS_CLIENTE = { particular: 'Particular', constructora: 'Constructora', arquitecto: 'Arquitecto', otro: 'Otro' };
export const ESTADOS_COTIZACION = { recibida: 'Recibida', en_revision: 'En revisión', enviada: 'Enviada' };

// Todo lo que llega de la API se escapa antes de ponerlo en la página.
export function escapar(valor) {
  const reemplazos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(valor ?? '').replace(/[&<>"']/g, (caracter) => reemplazos[caracter]);
}

// ---------- Formatos ----------

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// La API entrega las fechas como "2026-11-08 10:30:00".
function partesDe(fecha) {
  const [dia, hora = ''] = String(fecha).split(' ');
  const [anio, mes, numero] = dia.split('-').map(Number);
  return { anio, mes, numero, hora: hora.slice(0, 5) };
}

export function fechaCorta(fecha) {
  if (!fecha) return '';
  const { mes, numero } = partesDe(fecha);
  return `${String(numero).padStart(2, '0')} ${MESES[mes - 1]}`;
}

export const hora = (fecha) => (fecha ? partesDe(fecha).hora : '');

export function mesYAnio(fecha) {
  const { anio, mes } = partesDe(fecha);
  return `${MESES_LARGOS[mes - 1]} ${anio}`;
}

export function hoy() {
  const ahora = new Date();
  return `${String(ahora.getDate()).padStart(2, '0')} ${MESES[ahora.getMonth()]}`;
}

export function dinero(cantidad) {
  if (cantidad === null || cantidad === undefined) return 'Por definir';
  return `$${Number(cantidad).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;
}

export function iniciales(nombre) {
  return String(nombre || '?')
    .replace(/^(Arq|Ing|Lic)\.\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0] || '')
    .join('')
    .toUpperCase();
}

export const parametro = (nombre) => new URLSearchParams(window.location.search).get(nombre);

// ---------- Avisos y errores ----------

export function avisar(mensaje, tipo = 'ok') {
  const aviso = document.createElement('div');
  aviso.className = `toast ${tipo === 'error' ? 'error' : ''}`;
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.textContent = mensaje;
  document.body.append(aviso);
  setTimeout(() => aviso.remove(), 4500);
}

export function limpiarErrores(formulario) {
  formulario.querySelectorAll('[data-error]').forEach((elemento) => { elemento.textContent = ''; });
  formulario.querySelectorAll('.bad').forEach((elemento) => elemento.classList.remove('bad'));
}

// Pone cada mensaje de la API ("detalles") debajo de su campo, y el general arriba del botón.
export function mostrarErrores(formulario, error) {
  limpiarErrores(formulario);
  Object.entries(error.detalles || {}).forEach(([campo, mensaje]) => {
    const lugar = formulario.querySelector(`[data-error="${campo}"]`);
    if (lugar) lugar.textContent = mensaje;
    const control = formulario.elements[campo];
    if (control instanceof HTMLElement) control.classList.add('bad');
  });
  const general = formulario.querySelector('[data-error="general"]');
  if (general) general.textContent = error.message;
  else avisar(error.message, 'error');
}

// Desactiva el botón mientras se envía, para no mandar dos veces lo mismo.
export async function mientrasSeEnvia(boton, trabajo) {
  const texto = boton.textContent;
  boton.disabled = true;
  boton.textContent = 'Enviando…';
  try {
    return await trabajo();
  } finally {
    boton.disabled = false;
    boton.textContent = texto;
  }
}

// Muestra un error al cargar una pantalla, en lugar de dejarla vacía.
export function errorAlCargar(contenedor, error) {
  contenedor.innerHTML = `<div class="card"><h2>No se pudo cargar</h2><p class="suave">${escapar(error.message)}</p>
    <a class="btn s" href="">Intentar de nuevo</a></div>`;
}

// ---------- Archivos con sesión (fotos y documentos) ----------

export async function urlDeArchivo(pedir) {
  return URL.createObjectURL(await pedir());
}

// Foto ampliada al dar clic en una miniatura.
export function ampliarFoto(src) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'foto';
  dialogo.innerHTML = `<img alt="Foto del avance" src="${src}"><button class="btn s mt" type="button">Cerrar</button>`;
  dialogo.addEventListener('close', () => dialogo.remove());
  dialogo.querySelector('button').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (evento) => { if (evento.target === dialogo) dialogo.close(); });
  document.body.append(dialogo);
  dialogo.showModal();
}

// ---------- Tema claro u oscuro ----------

function iniciarTema(boton) {
  const raiz = document.documentElement;
  try {
    const guardado = localStorage.getItem('portal-tema');
    if (guardado) raiz.dataset.theme = guardado;
  } catch {
    // Sin almacenamiento: se usa el tema del sistema.
  }
  boton.addEventListener('click', () => {
    raiz.dataset.theme = getComputedStyle(raiz).colorScheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('portal-tema', raiz.dataset.theme);
    } catch {
      // No se recuerda, pero el cambio sí se aplica.
    }
  });
}

// ---------- Campana de pendientes (RF-18) ----------

function destinoDe(pendiente, usuario) {
  const carpeta = usuario.rol === 'admin' ? 'arquitecto' : 'cliente';
  if (pendiente.tipo === 'cotizacion') return 'arquitecto/inicio.html#cotizaciones';
  if (!pendiente.proyectoId) return inicioDe(usuario.rol);
  if (pendiente.tipo === 'mensaje') return `${carpeta}/chat.html?id=${pendiente.proyectoId}`;
  return `${carpeta}/proyecto.html?id=${pendiente.proyectoId}`;
}

async function cargarCampana(usuario) {
  const contador = document.getElementById('contador');
  const menu = document.getElementById('menuCampana');
  let datos;
  try {
    datos = await api.pendientes();
  } catch {
    return;
  }
  contador.textContent = datos.total;
  contador.hidden = datos.total === 0;
  menu.innerHTML = datos.total === 0
    ? '<p>Sin pendientes</p>'
    : datos.pendientes.map((pendiente) => `
        <a href="${enlace(destinoDe(pendiente, usuario))}" data-id="${pendiente.id}">
          ${escapar(pendiente.descripcion)}<small>${fechaCorta(pendiente.creadoEn)} · ${hora(pendiente.creadoEn)}</small>
        </a>`).join('') + '<button class="todo" type="button" id="leerTodo">Marcar todo como leído</button>';
}

function iniciarCampana(usuario) {
  const boton = document.getElementById('campana');
  const menu = document.getElementById('menuCampana');
  boton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    boton.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('.usr')) menu.hidden = true;
  });
  // Al abrir un pendiente se marca como leído y el contador baja (HU-22).
  menu.addEventListener('click', async (evento) => {
    if (evento.target.closest('#leerTodo')) {
      await api.marcarTodosLeidos().catch(() => {});
      cargarCampana(usuario);
      return;
    }
    const elegido = evento.target.closest('a[data-id]');
    if (!elegido) return;
    evento.preventDefault();
    await api.marcarLeido(elegido.dataset.id).catch(() => {});
    window.location.href = elegido.href;
  });
  cargarCampana(usuario);
  setInterval(() => cargarCampana(usuario), 30000);
}

// ---------- Encabezado ----------

export function montarEncabezado(usuario = null) {
  const encabezado = document.getElementById('encabezado');
  const nombre = usuario?.rol === 'cliente' && usuario.empresa && usuario.empresa !== usuario.nombre
    ? `${usuario.nombre} · ${usuario.empresa}`
    : usuario?.nombre;
  encabezado.innerHTML = `
    <button class="ic" id="tema" type="button" aria-label="Cambiar tema">◐</button>
    <a class="logo" href="${enlace(usuario ? inicioDe(usuario.rol) : 'index.html')}" aria-label="T Efficiency, inicio">
      <i>T</i><div>T EFFICIENCY<small>INNOVATION ADVISORS</small></div>
    </a>
    ${usuario ? `
      <div class="usr">
        <button class="bell" id="campana" type="button" aria-label="Pendientes" aria-expanded="false">🔔<b id="contador" hidden>0</b></button>
        <span class="nombre">${escapar(nombre)}</span>
        <button class="salir" id="salir" type="button">Salir</button>
        <div class="bm" id="menuCampana" hidden></div>
      </div>` : ''}`;

  iniciarTema(document.getElementById('tema'));
  if (!usuario) return;
  document.documentElement.classList.toggle('ses', usuario.rol === 'cliente');
  document.getElementById('salir').addEventListener('click', () => {
    cerrarSesion();
    irA('index.html');
  });
  iniciarCampana(usuario);
}
