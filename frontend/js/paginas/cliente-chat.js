// Pantalla 7 · Chat del cliente con el arquitecto responsable de su proyecto.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import { montarEncabezado, iniciales, parametro, errorAlCargar } from '../ui.js';
import { montarChat } from '../componentes/chat.js';

const usuario = exigirSesion('cliente');
montarEncabezado(usuario);
const id = parametro('id');

try {
  const { proyecto } = await api.proyecto(id);
  document.getElementById('iniciales').textContent = iniciales(proyecto.responsable);
  document.getElementById('responsable').textContent = proyecto.responsable;
  document.getElementById('proyecto').textContent = `${proyecto.nombre} · Solo para dudas`;
  document.getElementById('volver').href = `proyecto.html?id=${id}`;
  await montarChat({ contenedor: document.getElementById('chat'), proyectoId: id, usuario });
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
