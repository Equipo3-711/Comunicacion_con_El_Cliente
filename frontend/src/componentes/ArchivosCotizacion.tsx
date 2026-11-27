// Fotos o planos de una cotización (CC-02): se ven dentro del portal, en el visor, sin descargarlos.
// Los usan el personal (detalle de la cotización) y el cliente (al modificar su cotización).
import { useRef, useState } from 'react';
import { cotizaciones } from '../api';
import type { ArchivoCotizacion } from '../tipos';
import { Visor } from './Visor';

interface Props {
  archivos: ArchivoCotizacion[];
  vacio: string;
}

export function ArchivosCotizacion({ archivos, vacio }: Props) {
  const [abierto, setAbierto] = useState<{ archivo: Blob | null; nombre: string; error: string } | null>(null);
  const visor = useRef<HTMLDivElement>(null);

  async function ver(archivo: ArchivoCotizacion) {
    setAbierto({ archivo: null, nombre: archivo.nombre, error: '' });
    try {
      const contenido = await cotizaciones.verArchivo(archivo.id);
      setAbierto({ archivo: contenido, nombre: archivo.nombre, error: '' });
      visor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setAbierto({ archivo: null, nombre: archivo.nombre, error: (error as Error).message });
    }
  }

  return (
    <>
      <div>
        {archivos.length ? archivos.map((archivo) => (
          <div className="act" key={archivo.id}>
            <span>{archivo.nombre}</span>
            <button className="btn s" type="button" onClick={() => ver(archivo)}>Ver</button>
          </div>
        )) : <p className="vacio">{vacio}</p>}
      </div>
      <div ref={visor}>
        {abierto && <Visor className="mt" archivo={abierto.archivo} titulo={abierto.nombre} error={abierto.error} />}
      </div>
    </>
  );
}
