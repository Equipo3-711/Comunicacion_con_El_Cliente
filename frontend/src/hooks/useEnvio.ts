// Envía un formulario a la API: desactiva el botón mientras tanto (para no mandar dos veces lo mismo)
// y deja cada mensaje de error de la API («detalles») listo para mostrarlo debajo de su campo.
import { useCallback, useState } from 'react';
import { ErrorApi, type Detalles } from '../api/cliente';

export interface Envio {
  enviando: boolean;
  errores: Detalles;
  general: string;
  enviar: <T>(trabajo: () => Promise<T>, adaptar?: (detalles: Detalles) => Detalles) => Promise<T | undefined>;
  limpiar: () => void;
}

export function useEnvio(): Envio {
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Detalles>({});
  const [general, setGeneral] = useState('');

  const limpiar = useCallback(() => {
    setErrores({});
    setGeneral('');
  }, []);

  // Devuelve lo que respondió la API, o undefined si falló (el error ya quedó en pantalla).
  const enviar = useCallback(async <T,>(trabajo: () => Promise<T>, adaptar = (detalles: Detalles) => detalles) => {
    setEnviando(true);
    limpiar();
    try {
      return await trabajo();
    } catch (fallo) {
      const error = fallo instanceof ErrorApi ? fallo : new ErrorApi(0, (fallo as Error).message);
      setErrores(adaptar(error.detalles));
      setGeneral(error.message);
      return undefined;
    } finally {
      setEnviando(false);
    }
  }, [limpiar]);

  return { enviando, errores, general, enviar, limpiar };
}
