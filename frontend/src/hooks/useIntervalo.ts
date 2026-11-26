// Repite una tarea cada cierto tiempo mientras la pantalla esté abierta.
import { useEffect, useRef } from 'react';

export function useIntervalo(tarea: () => void, milisegundos: number): void {
  const actual = useRef(tarea);
  actual.current = tarea;

  useEffect(() => {
    const id = window.setInterval(() => actual.current(), milisegundos);
    return () => window.clearInterval(id);
  }, [milisegundos]);
}
