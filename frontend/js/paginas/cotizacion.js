// Pantalla 4 · Solicitar cotización (RF-03, CC-10). Cliente y correo salen de la cuenta.
// Con ?id=N el mismo formulario sirve para modificar una cotización ya enviada (RF-11).
import { api } from '../api.js';
import { exigirSesion, irA, actualizarUsuario } from '../sesion.js';
import {
  montarEncabezado, mostrarErrores, mientrasSeEnvia, escapar, avisar, parametro, errorAlCargar,
} from '../ui.js';

const MAX_ARCHIVOS = 5;
let usuario = exigirSesion('cliente');
montarEncabezado(usuario);

const formulario = document.getElementById('formulario');
const archivos = document.getElementById('archivos');
const zona = document.getElementById('zona');
const idModificar = parametro('id');

function llenarDatosDeLaCuenta(cuenta) {
  formulario.querySelector('#cliente').value = cuenta.empresa && cuenta.empresa !== cuenta.nombre
    ? `${cuenta.nombre} · ${cuenta.empresa}`
    : cuenta.nombre;
  formulario.querySelector('#correo').value = cuenta.correo;
  // Al modificar, se queda el teléfono que trae la cotización.
  if (!idModificar) formulario.telefono.value = cuenta.telefono || '';
}

llenarDatosDeLaCuenta(usuario);
api.yo().then(({ usuario: cuenta }) => {
  usuario = cuenta;
  actualizarUsuario(cuenta);
  llenarDatosDeLaCuenta(cuenta);
}).catch(() => {});

function mostrarElegidos() {
  document.getElementById('elegidos').innerHTML = [...archivos.files]
    .map((archivo) => `<li>${escapar(archivo.name)}</li>`).join('');
}

archivos.addEventListener('change', mostrarElegidos);
['dragenter', 'dragover'].forEach((tipo) => zona.addEventListener(tipo, (evento) => {
  evento.preventDefault();
  zona.classList.add('encima');
}));
['dragleave', 'drop'].forEach((tipo) => zona.addEventListener(tipo, () => zona.classList.remove('encima')));
zona.addEventListener('drop', (evento) => {
  evento.preventDefault();
  archivos.files = evento.dataTransfer.files;
  mostrarElegidos();
});

// ---------- Modificar una cotización ya enviada (RF-11) ----------

function marcar(nombre, valor) {
  const opcion = formulario.querySelector(`input[name="${nombre}"][value="${valor}"]`);
  if (opcion) opcion.checked = true;
}

// Los archivos que ya adjuntó se conservan; en este modo solo cambian los datos del formulario.
async function prepararModificacion() {
  const { cotizacion } = await api.cotizacion(idModificar);
  document.getElementById('tituloFormulario').textContent = 'Modificar cotización';
  document.title = 'Modificar cotización · T Efficiency';
  document.getElementById('enviar').textContent = 'Guardar cambios';
  zona.hidden = true;
  const aviso = document.getElementById('avisoEdicion');
  aviso.hidden = false;
  aviso.textContent = cotizacion.estado === 'enviada'
    ? 'Ya te enviamos esta cotización. Si la cambias, la revisaremos de nuevo y te avisaremos en la campana.'
    : 'Cambia lo que necesites. Las fotos o planos que adjuntaste se conservan.';
  formulario.telefono.value = cotizacion.telefono;
  marcar('tipoCliente', cotizacion.tipoCliente);
  marcar('tipoTrabajo', cotizacion.tipoTrabajo);
  formulario.direccion.value = cotizacion.direccion;
  formulario.medidas.value = cotizacion.medidas || '';
  formulario.descripcion.value = cotizacion.descripcion;
}

function enviarModificacion() {
  const { archivos: sinUsar, ...datos } = Object.fromEntries(new FormData(formulario));
  return api.modificarCotizacion(idModificar, datos);
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!idModificar && archivos.files.length > MAX_ARCHIVOS) {
    avisar(`Puedes adjuntar hasta ${MAX_ARCHIVOS} archivos.`, 'error');
    return;
  }
  const enviar = idModificar ? enviarModificacion : () => api.enviarCotizacion(new FormData(formulario));
  try {
    await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), enviar);
    irA(`cliente/proyectos.html?${idModificar ? 'modificada' : 'enviada'}=1`);
  } catch (error) {
    mostrarErrores(formulario, error);
  }
});

if (idModificar) {
  prepararModificacion().catch((error) => errorAlCargar(document.querySelector('main'), error));
}
