// Pantalla 3 · Mis proyectos del cliente, con su semáforo y sus cotizaciones enviadas.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import {
  montarEncabezado, escapar, fechaCorta, avisar, parametro, errorAlCargar,
  ESTADOS, TIPOS_TRABAJO, ESTADOS_COTIZACION,
} from '../ui.js';

const usuario = exigirSesion('cliente');
montarEncabezado(usuario);
if (parametro('enviada') === '1') avisar('Recibimos tu solicitud de cotización. Te avisaremos en la campana.');
if (parametro('modificada') === '1') avisar('Recibimos el cambio a tu cotización. La revisaremos de nuevo.');
if (parametro('bienvenida') === '1') avisar(`Bienvenida o bienvenido, ${usuario.nombre}. Ya puedes cotizar tu proyecto.`);

// Para el cliente, el semáforo solo dice si su duda ya se atendió o sigue pendiente.
function tarjeta(proyecto) {
  const atendido = proyecto.atencion === 'atendido';
  return `<article class="card g">
    <div class="row"><h3>${escapar(proyecto.nombre)}</h3>
      <span class="tag ${atendido ? 'atendido' : 'pendiente'}">${atendido ? 'Atendido' : 'Pendiente'}</span></div>
    <small class="suave">${escapar(ESTADOS[proyecto.estado])} · Última actualización: ${fechaCorta(proyecto.ultimaActualizacion)}</small>
    <div><a class="btn s" href="proyecto.html?id=${proyecto.id}">Ver proyecto</a></div>
  </article>`;
}

// El cliente puede pedir cambios a su cotización mientras no tenga proyecto (RF-11).
function cotizacion(registro) {
  const modificada = registro.modificadaEn ? ` · Modificada el ${fechaCorta(registro.modificadaEn)}` : '';
  return `<div class="act">
    <div><b>${escapar(TIPOS_TRABAJO[registro.tipoTrabajo])} · ${escapar(registro.direccion)}</b><br>
      <small class="suave">Enviada el ${fechaCorta(registro.creadoEn)}${modificada}${registro.archivos ? ` · ${registro.archivos} archivo(s)` : ''}</small></div>
    <div class="acciones">
      <span class="tag">${escapar(ESTADOS_COTIZACION[registro.estado])}</span>
      ${registro.proyectoId ? '' : `<a class="btn s" href="cotizacion.html?id=${registro.id}">Modificar</a>`}
    </div>
  </div>`;
}

try {
  const [{ proyectos }, { cotizaciones }] = await Promise.all([api.proyectos(), api.cotizaciones()]);
  document.getElementById('proyectos').innerHTML = proyectos.length
    ? proyectos.map(tarjeta).join('')
    : '<p class="vacio">Todavía no tienes proyectos. Solicita una cotización y, cuando la aprobemos, tu proyecto aparecerá aquí.</p>';
  document.getElementById('seccionCotizaciones').hidden = cotizaciones.length === 0;
  document.getElementById('cotizaciones').innerHTML = cotizaciones.map(cotizacion).join('');
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
