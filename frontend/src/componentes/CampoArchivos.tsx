// Zona para elegir archivos con los colores del portal: se toca para elegirlos o se arrastran encima.
// El campo del navegador queda oculto (pero se puede usar con teclado): su botón y su texto
// («Sin archivos seleccionados») no se pueden estilizar y en el celular el texto se cortaba.
// Los archivos elegidos se muestran como etiquetas.
import { useRef, useState, type DragEvent, type ReactNode } from 'react';

interface Props {
  nombre: string;
  titulo: string;
  ayuda: ReactNode;
  accept: string;
  multiple?: boolean;
}

export function CampoArchivos({ nombre, titulo, ayuda, accept, multiple = false }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [nombres, setNombres] = useState<string[]>([]);
  const [encima, setEncima] = useState(false);

  const mostrar = () => setNombres([...(entrada.current?.files ?? [])].map((archivo) => archivo.name));
  const sobre = (evento: DragEvent) => { evento.preventDefault(); setEncima(true); };
  function soltar(evento: DragEvent) {
    evento.preventDefault();
    setEncima(false);
    if (entrada.current) entrada.current.files = evento.dataTransfer.files;
    mostrar();
  }

  const elegidos = nombres.length === 1 ? '1 archivo elegido' : `${nombres.length} archivos elegidos`;
  return (
    <label className={`up ${encima ? 'encima' : ''}`} onDragEnter={sobre} onDragOver={sobre} onDragLeave={() => setEncima(false)} onDrop={soltar}>
      <b className="up-titulo">{titulo}</b>
      {ayuda}
      <input ref={entrada} className="archivo-oculto" type="file" name={nombre} multiple={multiple} accept={accept} onChange={mostrar} />
      <span className="btn s p up-boton" aria-hidden="true">{multiple ? 'Elegir archivos' : 'Elegir archivo'}</span>
      <span className="up-estado" aria-live="polite">{nombres.length ? elegidos : 'Todavía no eliges ninguno'}</span>
      {nombres.length > 0 && <ul>{nombres.map((archivo) => <li key={archivo}>{archivo}</li>)}</ul>}
    </label>
  );
}
