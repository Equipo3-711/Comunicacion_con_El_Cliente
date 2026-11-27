// Protege lo que la persona ya escribió en un formulario o una ventana.
// En el celular, «atrás» (el gesto, el botón o el que se usa para esconder el teclado) regresa
// en el historial: si no hay página anterior, como al abrir el portal desde un enlace de WhatsApp,
// cierra el navegador; si hay una ventana abierta, la cierra. En los dos casos se perdía lo escrito.
// Con este gancho, en cuanto escribe algo se agrega una entrada «guardia» al historial: «atrás» la
// consume y se le pregunta si de verdad quiere salir. Cerrar la pestaña con datos también pregunta.
import { useCallback, useEffect, useRef, type RefObject } from 'react';

export const MENSAJE_SALIR = '¿Salir sin guardar? Se perderá lo que escribiste.';

interface Opciones {
  // Solo protege mientras está activo (por ejemplo, mientras la ventana está abierta).
  activo?: boolean;
  // Qué hacer si confirma que quiere salir con «atrás». Sin esto, regresa a la página anterior.
  alSalir?: () => void;
}

export interface Proteccion {
  // true si no hay nada escrito o si la persona confirma que quiere salir.
  puedeSalir: () => boolean;
  // Se llama al guardar con éxito, antes de navegar. Devuelve true si la entrada de arriba del
  // historial es la guardia: entonces conviene navegar con «replace» para no dejarla repetida.
  sinCambios: () => boolean;
}

// Repite la entrada actual del historial, marcada como guardia. El enrutador solo lee sus propios
// campos (idx, key, usr), así que no ve ningún cambio de pantalla.
function agregarGuardia(): void {
  window.history.pushState({ ...window.history.state, guardia: true }, '', window.location.href);
}

const enGuardia = () => Boolean(window.history.state?.guardia);

export function useProtegerCambios(contenedor: RefObject<HTMLElement | null>, { activo = true, alSalir }: Opciones = {}): Proteccion {
  const conCambios = useRef(false);
  const alSalirActual = useRef(alSalir);
  alSalirActual.current = alSalir;

  const sinCambios = useCallback(() => {
    conCambios.current = false;
    return enGuardia();
  }, []);
  const puedeSalir = useCallback(() => {
    if (!conCambios.current) return true;
    if (!window.confirm(MENSAJE_SALIR)) return false;
    conCambios.current = false;
    return true;
  }, []);

  useEffect(() => {
    const elemento = contenedor.current;
    conCambios.current = false;
    if (!elemento || !activo) return undefined;

    const alEscribir = () => {
      if (conCambios.current) return;
      conCambios.current = true;
      if (!enGuardia()) agregarGuardia();
    };
    const alRegresar = () => {
      if (!conCambios.current) return;
      if (!puedeSalir()) {
        agregarGuardia();
        return;
      }
      if (alSalirActual.current) alSalirActual.current();
      else window.history.back();
    };
    const antesDeCerrar = (evento: BeforeUnloadEvent) => {
      if (!conCambios.current) return;
      evento.preventDefault();
      evento.returnValue = '';
    };

    elemento.addEventListener('input', alEscribir);
    window.addEventListener('popstate', alRegresar);
    window.addEventListener('beforeunload', antesDeCerrar);
    return () => {
      elemento.removeEventListener('input', alEscribir);
      window.removeEventListener('popstate', alRegresar);
      window.removeEventListener('beforeunload', antesDeCerrar);
      // Al cerrar una ventana que dejó su guardia arriba, se quita para que «atrás» no se quede sin efecto.
      if (alSalirActual.current && enGuardia()) window.history.back();
    };
  }, [contenedor, activo, puedeSalir]);

  return { puedeSalir, sinCambios };
}
