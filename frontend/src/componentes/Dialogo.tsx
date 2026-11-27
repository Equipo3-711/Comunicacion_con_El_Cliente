// Ventana modal con <dialog>: se cierra con «Cerrar», con Esc o dando clic fuera de la ventana.
// «Fuera» se mide con la caja de la ventana: un clic en su margen o entre dos campos no la cierra,
// ni tampoco soltar el dedo fuera después de seleccionar texto dentro.
// Con «proteger», si ya escribió algo, Esc, el clic fuera o «atrás» del celular preguntan antes de cerrar.
import { useEffect, useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { useProtegerCambios } from '../hooks/useProtegerCambios';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
  className?: string;
  proteger?: boolean;
}

function fueraDe(elemento: HTMLElement, x: number, y: number): boolean {
  const caja = elemento.getBoundingClientRect();
  return x < caja.left || x > caja.right || y < caja.top || y > caja.bottom;
}

export function Dialogo({ abierto, alCerrar, titulo, children, className, proteger = false }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const empezoFuera = useRef(false);
  const idTitulo = `titulo-${titulo.replace(/\W+/g, '-').toLowerCase()}`;
  const proteccion = useProtegerCambios(dialogo, { activo: abierto && proteger, alSalir: alCerrar });

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  function pedirCierre() {
    if (proteccion.puedeSalir()) alCerrar();
  }

  // El clic cuenta como «fuera» solo si empezó y terminó fuera de la caja de la ventana.
  function alPresionar(evento: PointerEvent<HTMLDialogElement>) {
    empezoFuera.current = evento.target === dialogo.current && fueraDe(evento.currentTarget, evento.clientX, evento.clientY);
  }
  function alSoltar(evento: MouseEvent<HTMLDialogElement>) {
    const cerrar = empezoFuera.current && evento.target === dialogo.current && fueraDe(evento.currentTarget, evento.clientX, evento.clientY);
    empezoFuera.current = false;
    if (cerrar) pedirCierre();
  }

  return (
    <dialog
      ref={dialogo}
      className={className}
      aria-labelledby={idTitulo}
      // Esc y, en Android, «atrás»: se decide aquí si se cierra.
      onCancel={(evento) => { evento.preventDefault(); pedirCierre(); }}
      onClose={() => { if (abierto) alCerrar(); }}
      onPointerDown={alPresionar}
      onClick={alSoltar}
    >
      <div className="row">
        <h2 className="sin-margen" id={idTitulo}>{titulo}</h2>
        <button className="btn s" type="button" onClick={alCerrar}>Cerrar</button>
      </div>
      {abierto && children}
    </dialog>
  );
}
