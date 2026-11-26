// Muestra un aviso según cómo se llegó a la pantalla (?enviada=1, ?bienvenida=1…) y luego
// quita el parámetro de la dirección, para que no se repita al recargar.
import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { useAvisos } from '../componentes/Avisos';

export function useAvisoDeLlegada(mensajes: Record<string, string>): void {
  const [parametros, setParametros] = useSearchParams();
  const avisar = useAvisos();
  const clave = Object.keys(mensajes).find((nombre) => parametros.get(nombre) === '1');
  // En desarrollo, React corre los efectos dos veces: el aviso se muestra solo una.
  const mostrado = useRef<string | null>(null);

  useEffect(() => {
    if (!clave || mostrado.current === clave) return;
    mostrado.current = clave;
    avisar(mensajes[clave]);
    setParametros((actuales) => {
      actuales.delete(clave);
      return actuales;
    }, { replace: true });
    // Solo al llegar con el parámetro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
}

// Lleva a la sección del #ancla cuando ya está en pantalla.
export function useIrAlAncla(listo: boolean): void {
  const { hash } = useLocation();
  useEffect(() => {
    if (listo && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [listo, hash]);
}
