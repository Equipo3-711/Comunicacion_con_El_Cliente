// Pantalla 10 · Proyecto del arquitecto: registrar actualizaciones (con fotos), cambiar el estado,
// subir documentos, marcar actividades como realizadas y editar los datos del proyecto (RF-16, RF-17).
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import {
  montarEncabezado, escapar, fechaCorta, hoy, avisar, mostrarErrores, limpiarErrores, mientrasSeEnvia,
  parametro, errorAlCargar, ESTADOS,
} from '../ui.js';

const usuario = exigirSesion('admin');
montarEncabezado(usuario);
const id = parametro('id');
let proyecto;

// ---------- Encabezado del proyecto y sus datos ----------

function dibujarProyecto() {
  document.title = `${proyecto.nombre} · T Efficiency`;
  document.getElementById('empresa').textContent = `${proyecto.empresa} · Proyecto #${proyecto.id}`;
  document.getElementById('nombre').textContent = proyecto.nombre;
  document.getElementById('estado').textContent = ESTADOS[proyecto.estado];
  const datos = document.getElementById('formDatos');
  datos.presupuesto.value = proyecto.presupuesto ?? '';
  datos.pagado.value = proyecto.pagado ?? '';
  datos.garantiaHasta.value = proyecto.garantiaHasta || '';
  datos.notasInternas.value = proyecto.notasInternas || '';
  document.getElementById('nuevoEstado').innerHTML = Object.entries(ESTADOS)
    .filter(([clave]) => clave !== proyecto.estado)
    .map(([clave, texto]) => `<option value="${clave}">${texto}</option>`).join('');
}

async function cargarProyecto() {
  ({ proyecto } = await api.proyecto(id));
  dibujarProyecto();
}

document.getElementById('formDatos').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const formulario = evento.target;
  try {
    await mientrasSeEnvia(formulario.querySelector('button'), () => api.actualizarDatos(id, Object.fromEntries(new FormData(formulario))));
    limpiarErrores(formulario);
    avisar('Datos guardados. El cliente ya ve el presupuesto, los pagos y la garantía.');
    await cargarProyecto();
  } catch (error) {
    mostrarErrores(formulario, error);
  }
});

// ---------- Registrar actualización: avance, solicitud, cambio de estado o documento ----------

const formulario = document.getElementById('formActualizacion');
const botonRegistrar = document.getElementById('registrar');
document.getElementById('automatico').textContent = `Fecha y responsable se llenan solos: ${hoy()} · ${usuario.nombre}`;

function tipoActual() {
  return formulario.tipo.value;
}

// Muestra solo los campos del tipo elegido.
function mostrarCamposDelTipo() {
  formulario.querySelectorAll('[data-para]').forEach((bloque) => {
    bloque.hidden = !bloque.dataset.para.split(' ').includes(tipoActual());
  });
  limpiarErrores(formulario);
}

formulario.addEventListener('change', (evento) => {
  if (evento.target.name === 'tipo') mostrarCamposDelTipo();
});

botonRegistrar.addEventListener('click', () => {
  formulario.hidden = !formulario.hidden;
  botonRegistrar.setAttribute('aria-expanded', String(!formulario.hidden));
});

// Cada tipo va a su propia ruta de la API.
function guardarSegunTipo() {
  const tipo = tipoActual();
  if (tipo === 'cambio_estado') return api.cambiarEstado(id, formulario.estado.value);
  if (tipo === 'documento') {
    const datos = new FormData();
    datos.append('nombre', formulario.nombre.value);
    if (formulario.archivo.files[0]) datos.append('archivo', formulario.archivo.files[0]);
    return api.subirDocumento(id, datos);
  }
  const datos = new FormData();
  datos.append('tipo', tipo);
  datos.append('descripcion', formulario.descripcion.value);
  [...formulario.fotos.files].forEach((foto) => datos.append('fotos', foto));
  return api.registrarActualizacion(id, datos);
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), guardarSegunTipo);
    formulario.reset();
    mostrarCamposDelTipo();
    formulario.hidden = true;
    avisar('Publicado. El cliente lo ve en su historial y en su campana.');
    await cargarProyecto();
  } catch (error) {
    mostrarErrores(formulario, error);
  }
});

// ---------- Actividades (RF-17) ----------

function filaActividad(actividad) {
  const accion = actividad.realizada
    ? `<span class="hecha">Realizada ✓ ${fechaCorta(actividad.realizadaEn)}</span>`
    : `<button class="btn s" type="button" data-actividad="${actividad.id}">Marcar como realizada</button>`;
  return `<div class="act"><span>${escapar(actividad.descripcion)}</span>${accion}</div>`;
}

async function cargarActividades() {
  const { actividades } = await api.actividades(id);
  document.getElementById('actividades').innerHTML = actividades.length
    ? actividades.map(filaActividad).join('')
    : '<p class="vacio">Agrega las actividades de la obra, por ejemplo «Medición en obra».</p>';
}

document.getElementById('actividades').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-actividad]');
  if (!boton) return;
  try {
    await mientrasSeEnvia(boton, () => api.marcarRealizada(boton.dataset.actividad));
    avisar('Actividad publicada en el historial del cliente.');
    await cargarActividades();
  } catch (error) {
    avisar(error.message, 'error');
  }
});

document.getElementById('formActividad').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const campo = evento.target.descripcion;
  try {
    await api.crearActividad(id, campo.value);
    campo.value = '';
    await cargarActividades();
  } catch (error) {
    avisar(error.detalles?.descripcion || error.message, 'error');
  }
});

// ---------- Carga inicial ----------

document.getElementById('abrirChat').href = `chat.html?id=${id}`;
document.getElementById('verComoCliente').href = `../cliente/proyecto.html?id=${id}`;
try {
  await Promise.all([cargarProyecto(), cargarActividades()]);
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
