// Detalle de una cotización para el personal: datos del formulario, fotos o planos del cliente,
// estado (Recibida, En revisión o Enviada) y el proyecto que se abrió a partir de ella.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import {
  montarEncabezado, escapar, fechaCorta, hora, avisar, mientrasSeEnvia, errorAlCargar, parametro, opciones,
  TIPOS_TRABAJO, TIPOS_CLIENTE, ESTADOS_COTIZACION,
} from '../ui.js';
import { protegerVisor, mostrarArchivo } from '../componentes/visor.js';

const usuario = exigirSesion('admin');
montarEncabezado(usuario);
const id = parametro('id');
const visor = document.getElementById('visor');
protegerVisor(visor);

function dato(titulo, valor) {
  return valor ? `<dt>${titulo}</dt><dd>${valor}</dd>` : '';
}

function dibujarDatos(cotizacion) {
  const empresa = cotizacion.empresa && cotizacion.empresa !== cotizacion.cliente ? ` · ${escapar(cotizacion.empresa)}` : '';
  const modificada = cotizacion.modificadaEn ? ` · el cliente la modificó el ${fechaCorta(cotizacion.modificadaEn)} a las ${hora(cotizacion.modificadaEn)}` : '';
  document.getElementById('datos').innerHTML = [
    dato('Cliente', `${escapar(cotizacion.cliente)}${empresa}`),
    dato('Correo', escapar(cotizacion.correo)),
    dato('Teléfono', escapar(cotizacion.telefono)),
    dato('Tipo de cliente', escapar(TIPOS_CLIENTE[cotizacion.tipoCliente])),
    dato('Dirección', escapar(cotizacion.direccion)),
    dato('Medidas', escapar(cotizacion.medidas)),
    dato('Descripción', escapar(cotizacion.descripcion)),
    dato('Recibida', `${fechaCorta(cotizacion.creadoEn)} a las ${hora(cotizacion.creadoEn)}${modificada}`),
  ].join('');
}

function dibujarArchivos(archivos) {
  document.getElementById('archivos').innerHTML = archivos.length
    ? archivos.map((archivo) => `<div class="act">
        <span>${escapar(archivo.nombre)}</span>
        <button class="btn s" type="button" data-archivo="${archivo.id}" data-nombre="${escapar(archivo.nombre)}">Ver</button>
      </div>`).join('')
    : '<p class="vacio">El cliente no adjuntó fotos ni planos.</p>';
}

function dibujarProyecto(cotizacion) {
  document.getElementById('proyecto').innerHTML = cotizacion.proyectoId
    ? `<p>Esta cotización ya tiene su proyecto.</p><a class="btn s" href="proyecto.html?id=${cotizacion.proyectoId}">Ver proyecto #${cotizacion.proyectoId}</a>`
    : `<p class="suave">Cuando el cliente acepte, abre su proyecto. Queda ligado a esta cotización.</p>
       <a class="btn p" href="inicio.html?cotizacion=${cotizacion.id}">Abrir proyecto</a>`;
}

function dibujar(cotizacion) {
  const titulo = `${TIPOS_TRABAJO[cotizacion.tipoTrabajo]} · ${cotizacion.cliente}`;
  document.getElementById('titulo').textContent = titulo;
  document.title = `Cotización: ${titulo} · T Efficiency`;
  document.getElementById('estado').textContent = ESTADOS_COTIZACION[cotizacion.estado];
  document.getElementById('nuevoEstado').innerHTML = opciones(ESTADOS_COTIZACION, cotizacion.estado);
  dibujarDatos(cotizacion);
  dibujarArchivos(cotizacion.archivos);
  dibujarProyecto(cotizacion);
}

async function cargar() {
  const { cotizacion } = await api.cotizacion(id);
  dibujar(cotizacion);
}

document.getElementById('archivos').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-archivo]');
  if (!boton) return;
  visor.hidden = false;
  visor.innerHTML = '<p class="vacio">Abriendo…</p>';
  try {
    await mostrarArchivo(visor, await api.verArchivoCotizacion(boton.dataset.archivo), boton.dataset.nombre);
    visor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    visor.innerHTML = `<p class="vacio">${escapar(error.message)}</p>`;
  }
});

document.getElementById('guardarEstado').addEventListener('click', async (evento) => {
  const estado = document.getElementById('nuevoEstado').value;
  try {
    await mientrasSeEnvia(evento.currentTarget, () => api.cambiarEstadoCotizacion(id, estado));
    avisar(`La cotización quedó «${ESTADOS_COTIZACION[estado]}». Le avisamos al cliente.`);
    await cargar();
  } catch (error) {
    avisar(error.message, 'error');
  }
});

try {
  await cargar();
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
