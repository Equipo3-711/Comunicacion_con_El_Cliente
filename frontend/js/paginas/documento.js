// Pantalla 6 · Visor de documentos: se ven en el portal, sin opción de descarga (RF-08, CC-02).
// Límite acordado en CC-02: no se puede impedir una captura de pantalla.
import { api } from '../api.js';
import { exigirSesion } from '../sesion.js';
import { montarEncabezado, parametro, errorAlCargar } from '../ui.js';

const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const usuario = exigirSesion('cliente', 'admin');
montarEncabezado(usuario);
const id = parametro('id');
const proyectoId = parametro('proyecto');
const visor = document.getElementById('visor');

// Sin menú contextual ni arrastre: no hay «Guardar imagen como…».
visor.addEventListener('contextmenu', (evento) => evento.preventDefault());
visor.addEventListener('dragstart', (evento) => evento.preventDefault());
document.getElementById('cerrar').href = `proyecto.html?id=${proyectoId}`;

async function dibujarPdf(archivo) {
  const { pdfjsLib } = window;
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const pdf = await pdfjsLib.getDocument({ data: await archivo.arrayBuffer() }).promise;
  visor.innerHTML = '';
  for (let numero = 1; numero <= pdf.numPages; numero += 1) {
    const pagina = await pdf.getPage(numero);
    const vista = pagina.getViewport({ scale: 1.5 });
    const lienzo = document.createElement('canvas');
    lienzo.width = vista.width;
    lienzo.height = vista.height;
    lienzo.setAttribute('aria-label', `Página ${numero} de ${pdf.numPages}`);
    visor.append(lienzo);
    await pagina.render({ canvasContext: lienzo.getContext('2d'), viewport: vista }).promise;
  }
}

function dibujarImagen(archivo) {
  const imagen = document.createElement('img');
  imagen.alt = document.getElementById('titulo').textContent;
  imagen.src = URL.createObjectURL(archivo);
  visor.replaceChildren(imagen);
}

try {
  const [{ proyecto }, { documentos }] = await Promise.all([api.proyecto(proyectoId), api.documentos(proyectoId)]);
  const registro = documentos.find((documento) => String(documento.id) === id);
  const titulo = `${registro ? registro.nombre : 'Documento'} · ${proyecto.nombre}`;
  document.getElementById('titulo').textContent = titulo;
  document.title = `${titulo} · T Efficiency`;

  const archivo = await api.verDocumento(id);
  if (archivo.type === 'application/pdf') await dibujarPdf(archivo);
  else dibujarImagen(archivo);
} catch (error) {
  errorAlCargar(document.getElementById('contenido'), error);
}
