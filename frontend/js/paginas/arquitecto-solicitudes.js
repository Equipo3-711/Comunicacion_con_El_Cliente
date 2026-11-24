// Bandeja de solicitudes del personal: todo lo que piden los clientes, llegue por donde llegue (RF-01),
// con su categoría (RF-04), su responsable (RF-05) y su estado.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import {
  montarEncabezado, escapar, fechaCorta, hora, avisar, mostrarErrores, limpiarErrores, mientrasSeEnvia,
  errorAlCargar, opciones, CANALES, CATEGORIAS, ESTADOS_SOLICITUD,
} from '../ui.js';

const usuario = exigirSesion('admin');
montarEncabezado(usuario);

const filtros = document.getElementById('filtros');
const lista = document.getElementById('lista');
let responsables = {};

filtros.estado.innerHTML = opciones(ESTADOS_SOLICITUD, '', 'Todos');
filtros.categoria.innerHTML = opciones(CATEGORIAS, '', 'Todas');
filtros.canal.innerHTML = opciones(CANALES, '', 'Todos');

// ---------- Bandeja ----------

function quienPide(solicitud) {
  const empresa = solicitud.empresa && solicitud.empresa !== solicitud.contacto ? ` · ${escapar(solicitud.empresa)}` : '';
  const sinCuenta = solicitud.clienteId ? '' : ' <small class="suave">(sin cuenta)</small>';
  return `<b>${escapar(solicitud.contacto)}</b>${empresa}${sinCuenta}`;
}

function detalles(solicitud) {
  const partes = [`#${solicitud.id}`, `${fechaCorta(solicitud.creadoEn)} · ${hora(solicitud.creadoEn)}`];
  if (solicitud.telefono) partes.push(escapar(solicitud.telefono));
  if (solicitud.proyectoId) partes.push(`<a href="proyecto.html?id=${solicitud.proyectoId}">${escapar(solicitud.proyecto)}</a>`);
  if (solicitud.cotizacionId) partes.push(`<a href="cotizacion.html?id=${solicitud.cotizacionId}">Ver cotización</a>`);
  if (solicitud.registradaPorId !== solicitud.clienteId) partes.push(`Registró: ${escapar(solicitud.registradaPor)}`);
  return partes.join(' · ');
}

function control(solicitud, campo, textos, elegida) {
  return `<select class="in chico" data-id="${solicitud.id}" data-campo="${campo}">
    ${elegida ? '' : '<option value="" selected disabled>Sin asignar</option>'}${opciones(textos, elegida)}
  </select>`;
}

function fila(solicitud) {
  return `<article class="act sol">
    <div>
      ${quienPide(solicitud)}
      <span class="tag ${solicitud.estado}">${escapar(ESTADOS_SOLICITUD[solicitud.estado])}</span>
      <span class="tag">${escapar(CANALES[solicitud.canal])}</span><br>
      <small class="suave">${detalles(solicitud)}</small>
      <p>${escapar(solicitud.descripcion)}</p>
    </div>
    <div class="controles">
      <label>Categoría ${control(solicitud, 'categoria', CATEGORIAS, solicitud.categoria)}</label>
      <label>Responsable ${control(solicitud, 'responsableId', responsables, solicitud.responsableId ?? '')}</label>
      <label>Estado ${control(solicitud, 'estado', ESTADOS_SOLICITUD, solicitud.estado)}</label>
    </div>
  </article>`;
}

function filtrosElegidos() {
  return Object.fromEntries([...new FormData(filtros)].filter(([, valor]) => valor));
}

async function cargar() {
  const { solicitudes } = await api.solicitudes(filtrosElegidos());
  const sinAtender = solicitudes.filter((solicitud) => solicitud.estado !== 'atendida').length;
  document.getElementById('resumen').textContent = `${solicitudes.length} solicitud(es) · ${sinAtender} sin atender`;
  lista.innerHTML = solicitudes.length
    ? solicitudes.map(fila).join('')
    : '<p class="vacio">No hay solicitudes con estos filtros.</p>';
}

filtros.addEventListener('change', () => cargar().catch((error) => avisar(error.message, 'error')));

// Cada cambio se guarda en cuanto se elige; si falla, se vuelve a dibujar la bandeja como estaba.
lista.addEventListener('change', async (evento) => {
  const control = evento.target.closest('select[data-campo]');
  if (!control) return;
  control.disabled = true;
  try {
    await api.actualizarSolicitud(control.dataset.id, { [control.dataset.campo]: control.value });
    avisar('Solicitud actualizada.');
  } catch (error) {
    avisar(error.message, 'error');
  }
  await cargar().catch(() => {});
});

// ---------- Registrar solicitud ----------

const dialogo = document.getElementById('dialogoRegistrar');
const formulario = document.getElementById('formRegistrar');
let clientes = [];
let proyectos = [];

// El portal no se elige: lo que llega por el portal entra solo a la bandeja.
document.getElementById('canales').insertAdjacentHTML('beforeend', Object.entries(CANALES)
  .filter(([valor]) => valor !== 'portal')
  .map(([valor, texto]) => `<label><input type="radio" name="canal" value="${valor}"><span>${escapar(texto)}</span></label>`)
  .join(''));
formulario.categoria.innerHTML = opciones(CATEGORIAS, '', 'Elige…');

function quienActual() {
  return formulario.quien.value;
}

function cambiarQuien() {
  formulario.querySelectorAll('[data-quien]').forEach((bloque) => { bloque.hidden = bloque.dataset.quien !== quienActual(); });
}

// Solo los proyectos de la empresa del cliente elegido.
function llenarProyectos() {
  const cliente = clientes.find((registro) => String(registro.id) === formulario.clienteId.value);
  const suyos = cliente ? proyectos.filter((proyecto) => proyecto.empresaId === cliente.empresaId) : [];
  formulario.proyectoId.innerHTML = opciones(Object.fromEntries(suyos.map((proyecto) => [proyecto.id, proyecto.nombre])), '', 'Ninguno');
}

async function abrirDialogo() {
  formulario.reset();
  limpiarErrores(formulario);
  cambiarQuien();
  formulario.responsableId.innerHTML = opciones(responsables, usuario.id);
  dialogo.showModal();
  if (clientes.length === 0) {
    [{ clientes }, { proyectos }] = await Promise.all([api.clientes(), api.proyectos()]);
  }
  const nombres = Object.fromEntries(clientes.map((cliente) => [
    cliente.id, cliente.empresa && cliente.empresa !== cliente.nombre ? `${cliente.nombre} · ${cliente.empresa}` : cliente.nombre,
  ]));
  formulario.clienteId.innerHTML = opciones(nombres, '', 'Elige…');
  llenarProyectos();
}

// Solo se manda lo que corresponde a «cliente registrado» o a «alguien sin cuenta».
function datosDelFormulario() {
  const { quien, ...datos } = Object.fromEntries(new FormData(formulario));
  if (quien === 'cliente') return { ...datos, contactoNombre: '', contactoTelefono: '' };
  return { ...datos, clienteId: '', proyectoId: '' };
}

// Si eligió «cliente registrado» pero no eligió a nadie, el aviso va debajo de la lista de clientes.
function adaptarErrores(error) {
  if (quienActual() !== 'cliente' || !error.detalles?.contactoNombre) return error;
  const { contactoNombre, ...resto } = error.detalles;
  return Object.assign(error, { detalles: { ...resto, clienteId: 'Elige al cliente.' } });
}

formulario.addEventListener('change', (evento) => {
  if (evento.target.name === 'quien') cambiarQuien();
  if (evento.target.name === 'clienteId') llenarProyectos();
});
document.getElementById('registrar').addEventListener('click', () => abrirDialogo().catch((error) => avisar(error.message, 'error')));
document.getElementById('cerrarDialogo').addEventListener('click', () => dialogo.close());

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), () => api.registrarSolicitud(datosDelFormulario()));
    dialogo.close();
    avisar('Solicitud registrada.');
    await cargar();
  } catch (error) {
    mostrarErrores(formulario, adaptarErrores(error));
  }
});

try {
  const datos = await api.responsables();
  responsables = Object.fromEntries(datos.responsables.map((persona) => [persona.id, persona.nombre]));
  await cargar();
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
