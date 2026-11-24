// Pantalla 9 · Inicio del arquitecto: clientes con su semáforo, alta de clientes y cotizaciones recibidas.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import {
  montarEncabezado, escapar, iniciales, fechaCorta, avisar, mostrarErrores, limpiarErrores, mientrasSeEnvia,
  errorAlCargar, parametro, ATENCION, TIPOS_TRABAJO, TIPOS_CLIENTE, ESTADOS_COTIZACION,
} from '../ui.js';

const usuario = exigirSesion('admin');
montarEncabezado(usuario);

const lista = document.getElementById('clientes');
const soloDudas = document.getElementById('soloDudas');
let proyectos = [];

// ---------- Mis clientes ----------

function filaCliente(proyecto) {
  const nombre = proyecto.cliente || proyecto.empresa;
  return `<div class="act">
    <a class="persona" href="proyecto.html?id=${proyecto.id}">
      <span class="av">${escapar(iniciales(nombre))}</span>
      <div><b>${escapar(nombre)}</b><small>Proyecto #${proyecto.id} · ${escapar(proyecto.nombre)}</small></div>
    </a>
    <div class="acciones">
      <a class="btn s" href="chat.html?id=${proyecto.id}">Chat</a>
      <span class="dot ${proyecto.atencion}" title="${ATENCION[proyecto.atencion]}" aria-label="${ATENCION[proyecto.atencion]}"></span>
    </div>
  </div>`;
}

function dibujarClientes() {
  const visibles = soloDudas.checked ? proyectos.filter((proyecto) => proyecto.atencion !== 'atendido') : proyectos;
  lista.innerHTML = visibles.length
    ? visibles.map(filaCliente).join('')
    : `<p class="vacio">${soloDudas.checked ? 'No hay dudas sin atender.' : 'Todavía no tienes clientes. Usa «Agregar usuario».'}</p>`;
  const conDudas = proyectos.filter((proyecto) => proyecto.atencion === 'no_atendido').length;
  const contador = document.getElementById('numDudas');
  contador.hidden = conDudas === 0;
  contador.textContent = `${conDudas} sin atender`;
}

async function cargarClientes() {
  ({ proyectos } = await api.proyectos());
  dibujarClientes();
}

soloDudas.addEventListener('change', dibujarClientes);
document.getElementById('dudas').addEventListener('click', () => {
  soloDudas.checked = true;
  dibujarClientes();
  lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---------- Cotizaciones recibidas ----------

let cotizaciones = [];

// Si ya se abrió su proyecto, se enlaza a él; si no, se ofrece abrirlo.
function accionCotizacion(registro, indice) {
  return registro.proyectoId
    ? `<a class="btn s" href="proyecto.html?id=${registro.proyectoId}">Proyecto #${registro.proyectoId}</a>`
    : `<button class="btn s" type="button" data-cotizacion="${indice}">Abrir proyecto</button>`;
}

function filaCotizacion(registro, indice) {
  return `<div class="act">
    <div>
      <b>${escapar(registro.cliente)} · ${escapar(registro.empresa)}</b>
      <span class="tag">${escapar(ESTADOS_COTIZACION[registro.estado])}</span>
      ${registro.modificadaEn ? '<span class="tag pendiente">Modificada</span>' : ''}<br>
      <small class="suave">${escapar(TIPOS_TRABAJO[registro.tipoTrabajo])} · ${escapar(TIPOS_CLIENTE[registro.tipoCliente])} ·
        ${escapar(registro.direccion)} · ${escapar(registro.telefono)} · ${fechaCorta(registro.creadoEn)}</small>
      <p style="margin:4px 0 0">${escapar(registro.descripcion)}${registro.medidas ? ` <small class="suave">(${escapar(registro.medidas)})</small>` : ''}</p>
    </div>
    <div class="acciones">
      <a class="btn s" href="cotizacion.html?id=${registro.id}">Ver${registro.archivos ? ` (${registro.archivos} archivo${registro.archivos > 1 ? 's' : ''})` : ''}</a>
      ${accionCotizacion(registro, indice)}
    </div>
  </div>`;
}

async function cargarCotizaciones() {
  ({ cotizaciones } = await api.cotizaciones());
  document.getElementById('listaCotizaciones').innerHTML = cotizaciones.length
    ? cotizaciones.map(filaCotizacion).join('')
    : '<p class="vacio">No hay cotizaciones.</p>';
}

document.getElementById('listaCotizaciones').addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-cotizacion]');
  if (boton) abrirDialogo(cotizaciones[boton.dataset.cotizacion]);
});

// ---------- Agregar usuario (cliente nuevo o ya registrado) ----------

const dialogo = document.getElementById('dialogoAgregar');
const formulario = document.getElementById('formAgregar');
// Cotización de la que nace el proyecto, para dejarlos ligados.
let cotizacionElegida = null;

function modoActual() {
  return formulario.modo.value;
}

function cambiarModo() {
  formulario.querySelectorAll('[data-modo]').forEach((bloque) => { bloque.hidden = bloque.dataset.modo !== modoActual(); });
  limpiarErrores(formulario);
}

async function llenarEmpresas(elegida) {
  const { empresas } = await api.empresas();
  formulario.empresaId.innerHTML = '<option value="">Elige…</option>' + empresas
    .map((empresa) => `<option value="${empresa.id}" ${empresa.nombre === elegida ? 'selected' : ''}>${escapar(empresa.nombre)}</option>`)
    .join('');
}

// Si viene de una cotización, se abre como «Cliente ya registrado» con su empresa y su tipo de trabajo.
async function abrirDialogo(cotizacion = null) {
  cotizacionElegida = cotizacion;
  formulario.reset();
  formulario.modo.value = cotizacion ? 'registrado' : 'nuevo';
  cambiarModo();
  await llenarEmpresas(cotizacion?.empresa).catch(() => {});
  if (cotizacion) formulario.tipoTrabajo.value = cotizacion.tipoTrabajo;
  dialogo.showModal();
}

function datosDelFormulario() {
  const datos = Object.fromEntries(new FormData(formulario));
  if (modoActual() === 'nuevo') return datos;
  const proyecto = { empresaId: datos.empresaId, nombre: datos.nombreProyecto, tipoTrabajo: datos.tipoTrabajo };
  return cotizacionElegida ? { ...proyecto, cotizacionId: cotizacionElegida.id } : proyecto;
}

// La API llama «nombre» al nombre de la obra cuando se crea solo el proyecto.
function adaptarErrores(error) {
  if (modoActual() !== 'registrado' || !error.detalles?.nombre) return error;
  const { nombre, ...resto } = error.detalles;
  return Object.assign(error, { detalles: { ...resto, nombreProyecto: nombre } });
}

formulario.addEventListener('change', (evento) => { if (evento.target.name === 'modo') cambiarModo(); });
document.getElementById('agregar').addEventListener('click', () => abrirDialogo());
document.getElementById('cerrarDialogo').addEventListener('click', () => dialogo.close());

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = datosDelFormulario();
  const enviar = modoActual() === 'nuevo' ? () => api.agregarCliente(datos) : () => api.crearProyecto(datos);
  try {
    await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), enviar);
    dialogo.close();
    avisar('Listo: el cliente ya está en tu cartera.');
    await Promise.all([cargarClientes(), cargarCotizaciones()]);
  } catch (error) {
    mostrarErrores(formulario, adaptarErrores(error));
  }
});

// ---------- Solicitudes por atender ----------

// Cuenta las que siguen abiertas y son del usuario o de nadie.
async function contarSolicitudes() {
  const { solicitudes } = await api.solicitudes();
  const porAtender = solicitudes.filter((solicitud) => solicitud.estado !== 'atendida'
    && (solicitud.responsableId === null || solicitud.responsableId === usuario.id)).length;
  const contador = document.getElementById('numSolicitudes');
  contador.hidden = porAtender === 0;
  contador.textContent = `${porAtender} por atender`;
}

try {
  await Promise.all([cargarClientes(), cargarCotizaciones()]);
  contarSolicitudes().catch(() => {});
  if (window.location.hash === '#cotizaciones') document.getElementById('cotizaciones').scrollIntoView();
  // Desde el detalle de una cotización: «Abrir proyecto» llega aquí con ?cotizacion=ID.
  const desdeCotizacion = cotizaciones.find((registro) => String(registro.id) === parametro('cotizacion') && !registro.proyectoId);
  if (desdeCotizacion) await abrirDialogo(desdeCotizacion);
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
