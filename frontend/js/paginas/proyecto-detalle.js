// Pantalla 5 · Detalles del proyecto: presupuesto, pagos, garantía, historial y documentos (RF-08).
// El arquitecto también puede abrirla para ver lo mismo que ve su cliente.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import { montarEncabezado, escapar, dinero, mesYAnio, fechaCorta, parametro, errorAlCargar, ESTADOS } from '../ui.js';
import { montarHistorial } from '../componentes/historial.js';

const usuario = exigirSesion('cliente', 'admin');
montarEncabezado(usuario);
const id = parametro('id');

function documento(registro) {
  return `<div class="act">
    <span>${escapar(registro.nombre)} <small class="suave">· ${fechaCorta(registro.creadoEn)}</small></span>
    <a class="btn s" href="documento.html?id=${registro.id}&proyecto=${id}">Ver</a>
  </div>`;
}

try {
  const [{ proyecto }, { documentos }] = await Promise.all([api.proyecto(id), api.documentos(id)]);
  document.title = `${proyecto.nombre} · T Efficiency`;
  document.getElementById('nombre').textContent = proyecto.nombre;
  document.getElementById('estado').textContent = ESTADOS[proyecto.estado];
  document.getElementById('presupuesto').textContent = dinero(proyecto.presupuesto);
  document.getElementById('pagado').textContent = dinero(proyecto.pagado);
  document.getElementById('garantia').textContent = proyecto.garantiaHasta ? `Hasta ${mesYAnio(proyecto.garantiaHasta)}` : 'Por definir';
  document.getElementById('documentos').innerHTML = documentos.length
    ? documentos.map(documento).join('')
    : '<p class="vacio">Todavía no hay documentos.</p>';

  const esArquitecto = usuario.rol === 'admin';
  document.getElementById('abrirChat').href = esArquitecto ? `../arquitecto/chat.html?id=${id}` : `chat.html?id=${id}`;
  document.getElementById('vistaCliente').hidden = !esArquitecto;
  document.getElementById('volverArquitecto').href = `../arquitecto/proyecto.html?id=${id}`;

  await montarHistorial(document.getElementById('historial'), id);
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
