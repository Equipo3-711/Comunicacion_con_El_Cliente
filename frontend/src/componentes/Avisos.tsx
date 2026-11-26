// Avisos que aparecen abajo unos segundos: «Solicitud registrada», errores al guardar…
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type TipoAviso = 'ok' | 'error';
type Avisar = (mensaje: string, tipo?: TipoAviso) => void;

interface Aviso {
  id: number;
  mensaje: string;
  tipo: TipoAviso;
}

const DURACION_MS = 4500;
const ContextoAvisos = createContext<Avisar | null>(null);

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(1);

  const avisar = useCallback<Avisar>((mensaje, tipo = 'ok') => {
    const id = siguiente.current++;
    setAvisos((actuales) => [...actuales, { id, mensaje, tipo }]);
    window.setTimeout(() => setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id)), DURACION_MS);
  }, []);

  const valor = useMemo(() => avisar, [avisar]);
  return (
    <ContextoAvisos.Provider value={valor}>
      {children}
      <div className="toasts">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`toast ${aviso.tipo === 'error' ? 'error' : ''}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
            {aviso.mensaje}
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  );
}

export function useAvisos(): Avisar {
  const avisar = useContext(ContextoAvisos);
  if (!avisar) throw new Error('useAvisos se usa dentro de <ProveedorAvisos>.');
  return avisar;
}
