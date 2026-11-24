// Pantalla 6 · Visor de documentos: se ven en el portal, sin opción de descarga (RF-08, CC-02).
// Límite acordado en CC-02: no se puede impedir una captura de pantalla.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import { montarEncabezado, parametro, errorAlCargar } from '../ui.js';
import { protegerVisor, mostrarArchivo } from '../componentes/visor.js';

const usuario = exigirSesion('cliente', 'admin');
montarEncabezado(usuario);
const id = parametro('id');
const proyectoId = parametro('proyecto');
const visor = document.getElementById('visor');

protegerVisor(visor);
document.getElementById('cerrar').href = `proyecto.html?id=${proyectoId}`;

try {
  const [{ proyecto }, { documentos }] = await Promise.all([api.proyecto(proyectoId), api.documentos(proyectoId)]);
  const registro = documentos.find((documento) => String(documento.id) === id);
  const titulo = `${registro ? registro.nombre : 'Documento'} · ${proyecto.nombre}`;
  document.getElementById('titulo').textContent = titulo;
  document.title = `${titulo} · T Efficiency`;

  await mostrarArchivo(visor, await api.verDocumento(id), titulo);
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
