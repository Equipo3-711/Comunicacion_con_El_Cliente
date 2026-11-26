// Pide datos a la API al abrir la pantalla y guarda si siguen cargando o si fallaron.
import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export interface Carga<T> {
  datos: T | null;
  error: Error | null;
  cargando: boolean;
  recargar: () => Promise<void>;
}

export function useCarga<T>(pedir: () => Promise<T>, dependencias: DependencyList): Carga<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [cargando, setCargando] = useState(true);
  const pedirActual = useRef(pedir);
  pedirActual.current = pedir;

  // Una respuesta que llega después de cambiar de pantalla (u otra más nueva) se ignora.
  const vigente = useRef(0);

  const recargar = useCallback(async () => {
    const turno = ++vigente.current;
    try {
      const nuevos = await pedirActual.current();
      if (turno !== vigente.current) return;
      setDatos(nuevos);
      setError(null);
    } catch (fallo) {
      if (turno === vigente.current) setError(fallo as Error);
    } finally {
      if (turno === vigente.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    setCargando(true);
    recargar();
    return () => { vigente.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  return { datos, error, cargando, recargar };
}
