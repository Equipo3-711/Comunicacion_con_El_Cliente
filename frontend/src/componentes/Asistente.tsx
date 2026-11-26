// Respuestas automáticas a preguntas frecuentes dentro del chat del cliente (RF-13).
// Antes de escribir, el cliente ve las preguntas frecuentes; si escribe su duda y se parece a una,
// el chat le sugiere la respuesta y le pregunta si resolvió su duda. Si no, su mensaje va al arquitecto.
// Las respuestas automáticas no se guardan en el chat ni cambian el semáforo: solo se ven en esta pantalla.
import { useCallback, useEffect, useState } from 'react';
import { preguntas as apiPreguntas } from '../api';
import type { PreguntaFrecuente } from '../tipos';

type Estado = 'abierto' | 'resuelto' | 'cerrado';

export interface Intercambio {
  id: number;
  // «pregunta»: la eligió de la lista; «sugerencia»: la escribió y se parece a una pregunta frecuente.
  origen: 'pregunta' | 'sugerencia';
  texto: string;
  sugerencias: PreguntaFrecuente[];
  estado: Estado;
}

export interface Asistente {
  activo: boolean;
  frecuentes: PreguntaFrecuente[];
  intercambios: Intercambio[];
  elegir: (pregunta: PreguntaFrecuente) => void;
  revisar: (texto: string) => Promise<boolean>;
  resolver: (intercambio: Intercambio, pregunta: PreguntaFrecuente) => void;
  cerrar: (intercambio: Intercambio) => void;
}

let siguienteId = 1;

export function useAsistente(activo: boolean): Asistente {
  const [frecuentes, setFrecuentes] = useState<PreguntaFrecuente[]>([]);
  const [intercambios, setIntercambios] = useState<Intercambio[]>([]);

  useEffect(() => {
    if (!activo) return;
    apiPreguntas.listar().then(({ preguntas }) => setFrecuentes(preguntas)).catch(() => {});
  }, [activo]);

  const agregar = useCallback((nuevo: Omit<Intercambio, 'id' | 'estado'>) => {
    setIntercambios((actuales) => [...actuales, { ...nuevo, id: siguienteId++, estado: 'abierto' }]);
  }, []);

  const cambiar = useCallback((intercambio: Intercambio, estado: Estado) => {
    setIntercambios((actuales) => actuales.map((otro) => (otro.id === intercambio.id ? { ...otro, estado } : otro)));
  }, []);

  const elegir = useCallback((pregunta: PreguntaFrecuente) => {
    agregar({ origen: 'pregunta', texto: pregunta.pregunta, sugerencias: [pregunta] });
  }, [agregar]);

  // true si encontró algo que sugerir (el mensaje espera a que el cliente conteste).
  const revisar = useCallback(async (texto: string) => {
    if (!activo) return false;
    try {
      const { sugerencias } = await apiPreguntas.sugerencias(texto);
      if (sugerencias.length === 0) return false;
      agregar({ origen: 'sugerencia', texto, sugerencias });
      return true;
    } catch {
      // Si no se pueden revisar las sugerencias, el mensaje se manda como siempre.
      return false;
    }
  }, [activo, agregar]);

  const resolver = useCallback((intercambio: Intercambio, pregunta: PreguntaFrecuente) => {
    cambiar(intercambio, 'resuelto');
    apiPreguntas.marcarResuelta(pregunta.id).catch(() => {});
  }, [cambiar]);

  // Si la escribió, su mensaje se manda y aparece en el chat: la sugerencia ya no hace falta.
  const cerrar = useCallback((intercambio: Intercambio) => {
    if (intercambio.origen === 'sugerencia') {
      setIntercambios((actuales) => actuales.filter((otro) => otro.id !== intercambio.id));
    } else {
      cambiar(intercambio, 'cerrado');
    }
  }, [cambiar]);

  return { activo, frecuentes, intercambios, elegir, revisar, resolver, cerrar };
}

// Botones con las preguntas frecuentes, arriba del campo para escribir.
export function PreguntasFrecuentes({ asistente }: { asistente: Asistente }) {
  if (!asistente.activo || asistente.frecuentes.length === 0) return null;
  return (
    <div className="faq">
      <p className="ttl">Preguntas frecuentes</p>
      <div className="opciones">
        {asistente.frecuentes.map((pregunta) => (
          <button key={pregunta.id} className="btn s" type="button" onClick={() => asistente.elegir(pregunta)}>{pregunta.pregunta}</button>
        ))}
      </div>
    </div>
  );
}

interface PropsRespuesta {
  intercambio: Intercambio;
  asistente: Asistente;
  // «No»: si la escribió, se manda su mensaje al arquitecto; si la eligió de la lista, puede escribir.
  alNoResolver: (intercambio: Intercambio) => void;
}

function Acciones({ intercambio, asistente, alNoResolver }: PropsRespuesta) {
  const varias = intercambio.sugerencias.length > 1;
  return (
    <div className="acciones-auto">
      {intercambio.sugerencias.map((pregunta) => (
        <button key={pregunta.id} className="btn s p" type="button" onClick={() => asistente.resolver(intercambio, pregunta)}>
          {varias ? `Sí: «${pregunta.pregunta}»` : 'Sí, esto responde mi duda'}
        </button>
      ))}
      <button className="btn s" type="button" onClick={() => alNoResolver(intercambio)}>
        {intercambio.origen === 'sugerencia' ? 'No, enviar mi mensaje al arquitecto' : 'No, quiero escribirle al arquitecto'}
      </button>
    </div>
  );
}

function Respuesta({ intercambio, asistente, alNoResolver }: PropsRespuesta) {
  const [unica] = intercambio.sugerencias;
  return (
    <div className="b auto">
      <small>Respuesta automática</small>
      {intercambio.origen === 'pregunta'
        ? unica.respuesta
        : (
          <>
            {intercambio.sugerencias.length > 1 ? 'Quizá alguna de estas responde tu duda:' : 'Quizá esto responde tu duda:'}
            {intercambio.sugerencias.map((pregunta) => (
              <span className="sugerencia" key={pregunta.id}><b>{pregunta.pregunta}</b>{pregunta.respuesta}</span>
            ))}
          </>
        )}
      {intercambio.estado === 'abierto' && <p className="pregunta-auto">¿Esto responde tu duda?</p>}
      {intercambio.estado === 'abierto' && <Acciones intercambio={intercambio} asistente={asistente} alNoResolver={alNoResolver} />}
      {intercambio.estado === 'resuelto' && <p className="pregunta-auto">¡Qué bueno! Si tienes otra duda, escríbela aquí.</p>}
      {intercambio.estado === 'cerrado' && <p className="pregunta-auto">Escribe tu duda abajo y el arquitecto te responderá aquí.</p>}
    </div>
  );
}

export function Intercambios({ asistente, alNoResolver }: Omit<PropsRespuesta, 'intercambio'>) {
  return (
    <>
      {asistente.intercambios.map((intercambio) => (
        <div className="intercambio" key={intercambio.id}>
          <div className="b me">
            <small>Tú · {intercambio.origen === 'pregunta' ? 'pregunta frecuente' : 'sin enviar todavía'}</small>
            {intercambio.texto}
          </div>
          <Respuesta intercambio={intercambio} asistente={asistente} alNoResolver={alNoResolver} />
        </div>
      ))}
    </>
  );
}
