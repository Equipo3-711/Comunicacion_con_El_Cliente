// Pantalla 4 · Solicitar cotización (RF-03, CC-10). Cliente y correo salen de la cuenta.
import { api } from '../api.js';
import { exigirSesion, irA, actualizarUsuario } from '../sesion.js';
import { montarEncabezado, mostrarErrores, mientrasSeEnvia, escapar, avisar } from '../ui.js';

const MAX_ARCHIVOS = 5;
let usuario = exigirSesion('cliente');
montarEncabezado(usuario);

const formulario = document.getElementById('formulario');
const archivos = document.getElementById('archivos');
const zona = document.getElementById('zona');

function llenarDatosDeLaCuenta(cuenta) {
  formulario.querySelector('#cliente').value = cuenta.empresa && cuenta.empresa !== cuenta.nombre
    ? `${cuenta.nombre} · ${cuenta.empresa}`
    : cuenta.nombre;
  formulario.querySelector('#correo').value = cuenta.correo;
  formulario.telefono.value = cuenta.telefono || '';
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

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (archivos.files.length > MAX_ARCHIVOS) {
    avisar(`Puedes adjuntar hasta ${MAX_ARCHIVOS} archivos.`, 'error');
    return;
  }
  try {
    await mientrasSeEnvia(formulario.querySelector('button[type="submit"]'), () => api.enviarCotizacion(new FormData(formulario)));
    irA('cliente/proyectos.html?enviada=1');
  } catch (error) {
    mostrarErrores(formulario, error);
  }
});
