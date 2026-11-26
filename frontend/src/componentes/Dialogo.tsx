// Ventana modal con <dialog>: se cierra con Esc, con «Cerrar» o dando clic fuera.
import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
  className?: string;
}

export function Dialogo({ abierto, alCerrar, titulo, children, className }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = `titulo-${titulo.replace(/\W+/g, '-').toLowerCase()}`;

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      className={className}
      aria-labelledby={idTitulo}
      onClose={alCerrar}
      onClick={(evento) => { if (evento.target === dialogo.current) alCerrar(); }}
    >
      <div className="row">
        <h2 className="sin-margen" id={idTitulo}>{titulo}</h2>
        <button className="btn s" type="button" onClick={alCerrar}>Cerrar</button>
      </div>
      {abierto && children}
    </dialog>
  );
}
