// Lo que se muestra mientras carga una pantalla o si no se pudo cargar.
import type { ReactNode } from 'react';
import type { Carga } from '../hooks/useCarga';

export function ErrorAlCargar({ error }: { error: Error }) {
  return (
    <div className="card" role="alert">
      <h2>No se pudo cargar</h2>
      <p className="suave">{error.message}</p>
      <button className="btn s" type="button" onClick={() => window.location.reload()}>Intentar de nuevo</button>
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return <p className="vacio" aria-live="polite">{texto}</p>;
}

// Muestra «Cargando…», el error o el contenido según cómo vaya la carga.
export function SegunCarga<T>({ carga, children }: { carga: Carga<T>; children: (datos: T) => ReactNode }) {
  if (carga.error && !carga.datos) return <ErrorAlCargar error={carga.error} />;
  if (!carga.datos) return <Cargando />;
  return <>{children(carga.datos)}</>;
}
