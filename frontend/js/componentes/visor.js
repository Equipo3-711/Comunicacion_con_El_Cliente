// Muestra un PDF o una imagen dentro del portal, sin opción de descarga (CC-02).
// Para los PDF, la página debe cargar pdf.js (window.pdfjsLib) antes de usarlo.
// Límite acordado en CC-02: no se puede impedir una captura de pantalla.
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Sin menú contextual ni arrastre: no hay «Guardar imagen como…».
export function protegerVisor(visor) {
  visor.addEventListener('contextmenu', (evento) => evento.preventDefault());
  visor.addEventListener('dragstart', (evento) => evento.preventDefault());
}

async function dibujarPdf(visor, archivo) {
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

function dibujarImagen(visor, archivo, titulo) {
  const imagen = document.createElement('img');
  imagen.alt = titulo;
  imagen.src = URL.createObjectURL(archivo);
  visor.replaceChildren(imagen);
}

export async function mostrarArchivo(visor, archivo, titulo) {
  if (archivo.type === 'application/pdf') await dibujarPdf(visor, archivo);
  else dibujarImagen(visor, archivo, titulo);
}
