// Muestra un PDF o una imagen dentro del portal, sin opción de descarga (CC-02).
// Los PDF se dibujan con pdf.js como imágenes, sin la barra del navegador que ofrece descargar o imprimir.
// Límite acordado en CC-02: no se puede impedir una captura de pantalla.
import { useEffect, useRef, useState } from 'react';

interface Props {
  archivo: Blob | null;
  titulo: string;
  error?: string;
  className?: string;
}

const evitar = (evento: { preventDefault: () => void }) => evento.preventDefault();

// pdf.js se carga solo cuando hace falta, para que las demás pantallas abran más rápido.
// Se usa su versión «legacy», que también funciona en celulares y navegadores que no son los más nuevos.
async function dibujarPdf(contenedor: HTMLElement, archivo: Blob, cancelado: () => boolean): Promise<void> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { default: trabajador } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = trabajador;
  const carga = pdfjs.getDocument({ data: await archivo.arrayBuffer() });
  const pdf = await carga.promise;
  // Si mientras cargaba se abrió otro archivo (o React volvió a correr el efecto), este ya no dibuja nada:
  // así no borra ni mezcla las páginas del que sí se está mostrando.
  if (cancelado()) {
    await carga.destroy();
    return;
  }
  contenedor.replaceChildren();
  for (let numero = 1; numero <= pdf.numPages; numero += 1) {
    const pagina = await pdf.getPage(numero);
    if (cancelado()) {
      await carga.destroy();
      return;
    }
    const vista = pagina.getViewport({ scale: 1.5 });
    const lienzo = document.createElement('canvas');
    lienzo.width = vista.width;
    lienzo.height = vista.height;
    lienzo.setAttribute('aria-label', `Página ${numero} de ${pdf.numPages}`);
    contenedor.append(lienzo);
    await pagina.render({ canvas: lienzo, viewport: vista }).promise;
  }
}

export function Visor({ archivo, titulo, error, className = '' }: Props) {
  const paginas = useRef<HTMLDivElement>(null);
  const [imagen, setImagen] = useState<string | null>(null);
  const [fallo, setFallo] = useState('');

  useEffect(() => {
    setImagen(null);
    setFallo('');
    paginas.current?.replaceChildren();
    if (!archivo) return undefined;
    if (archivo.type !== 'application/pdf') {
      const url = URL.createObjectURL(archivo);
      setImagen(url);
      return () => URL.revokeObjectURL(url);
    }
    let cancelado = false;
    if (paginas.current) {
      dibujarPdf(paginas.current, archivo, () => cancelado).catch(() => {
        if (!cancelado) setFallo('No se pudo mostrar el PDF.');
      });
    }
    return () => { cancelado = true; };
  }, [archivo]);

  const mensaje = error || fallo;
  return (
    <div className={`doc ${className}`.trim()} aria-live="polite" onContextMenu={evitar} onDragStart={evitar}>
      {mensaje && <p className="vacio">{mensaje}</p>}
      {!mensaje && !archivo && <p className="vacio">Abriendo…</p>}
      {imagen && <img src={imagen} alt={titulo} />}
      <div className="paginas" ref={paginas} />
    </div>
  );
}
