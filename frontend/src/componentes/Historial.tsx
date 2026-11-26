// Historial del proyecto: lo que ha sucedido, con tipo, fecha, responsable y fotos (RF-06, RF-07, RF-16).
import { useEffect, useRef, useState } from 'react';
import { proyectos } from '../api';
import { useCarga } from '../hooks/useCarga';
import { fechaCorta } from '../utilidades/formatos';
import { TIPOS_EVENTO } from '../utilidades/textos';
import type { EventoHistorial } from '../tipos';
import { SegunCarga } from './Estados';

// Las fotos se piden con la sesión y se muestran sin enlace de descarga.
function FotoMini({ id, alAmpliar }: { id: number; alAmpliar: (src: string) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    proyectos.verFoto(id)
      .then((archivo) => { url = URL.createObjectURL(archivo); setSrc(url); })
      .catch(() => setFallo(true));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [id]);

  if (fallo) return null;
  return (
    <button className="foto-mini" type="button" aria-label="Ampliar foto del avance" onClick={() => src && alAmpliar(src)}>
      {src && <img alt="" src={src} />}
    </button>
  );
}

// Foto ampliada al dar clic en una miniatura: la imagen y «Cerrar» debajo, como en las interfaces V2.
function FotoAmpliada({ src, alCerrar }: { src: string | null; alCerrar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (src && !dialogo.current?.open) dialogo.current?.showModal();
  }, [src]);
  if (!src) return null;
  return (
    <dialog
      ref={dialogo}
      className="foto"
      onClose={alCerrar}
      onClick={(evento) => { if (evento.target === dialogo.current) dialogo.current?.close(); }}
    >
      <img alt="Foto del avance" src={src} />
      <button className="btn s mt" type="button" onClick={() => dialogo.current?.close()}>Cerrar</button>
    </dialog>
  );
}

function Evento({ registro, alAmpliar }: { registro: EventoHistorial; alAmpliar: (src: string) => void }) {
  return (
    <div className="ti">
      <b>{TIPOS_EVENTO[registro.tipo] || registro.tipo}</b>
      <span>{registro.descripcion}</span>
      <small>{fechaCorta(registro.fecha)} · {registro.responsable}</small>
      {registro.fotos?.length > 0 && (
        <div className="fotos">
          {registro.fotos.map((foto) => <FotoMini key={foto} id={foto} alAmpliar={alAmpliar} />)}
        </div>
      )}
    </div>
  );
}

export function Historial({ proyectoId }: { proyectoId: string }) {
  const carga = useCarga(() => proyectos.historial(proyectoId), [proyectoId]);
  const [ampliada, setAmpliada] = useState<string | null>(null);

  return (
    <>
      <SegunCarga carga={carga}>
        {({ historial }) => (historial.length
          ? historial.map((registro) => <Evento key={registro.id} registro={registro} alAmpliar={setAmpliada} />)
          : <p className="vacio">Todavía no hay movimientos en este proyecto.</p>)}
      </SegunCarga>
      <FotoAmpliada src={ampliada} alCerrar={() => setAmpliada(null)} />
    </>
  );
}
