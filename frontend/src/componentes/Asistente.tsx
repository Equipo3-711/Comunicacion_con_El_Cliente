// Asistente virtual del chat del cliente (RF-13): responde al momento las preguntas frecuentes.
// En un chat sin mensajes saluda solo y ofrece un menú de preguntas, con flechas para pasar de página;
// si ya hay conversación, se ven primero los mensajes y el menú se abre con «Preguntar al asistente virtual».
// Al elegir una, contesta y pregunta si resolvió la duda; desde ahí se regresa al menú o se habla con el arquitecto.
// Si el cliente escribe su duda y se parece a una pregunta frecuente, primero le sugiere la respuesta;
// si no le sirve, su mensaje va al arquitecto.
// Lo que contesta el asistente no se guarda en el chat ni cambia el semáforo: solo se ve en esta pantalla.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { preguntas as apiPreguntas, proyectos as apiProyectos } from '../api';
import type { PreguntaFrecuente } from '../tipos';

// Primera opción del menú: el seguimiento automático de la obra (CC-05), con los datos del proyecto.
export const PREGUNTA_OBRA = -1;
const OBRA: PreguntaFrecuente = { id: PREGUNTA_OBRA, pregunta: '¿Cómo va mi obra?', respuesta: '' };
const SIN_RESUMEN = 'No pude revisar tu obra en este momento. Intenta de nuevo o pregúntale a tu arquitecto.';

async function respuestaDeObra(proyectoId: string): Promise<string> {
  try {
    const { resumen } = await apiProyectos.resumen(proyectoId);
    return [...resumen.puntos, ...resumen.avisos].join('\n');
  } catch {
    return SIN_RESUMEN;
  }
}

type Estado = 'abierto' | 'resuelto' | 'cerrado';

export interface Intercambio {
  id: number;
  // «pregunta»: la eligió del menú; «sugerencia»: la escribió y se parece a una pregunta frecuente.
  origen: 'pregunta' | 'sugerencia';
  texto: string;
  sugerencias: PreguntaFrecuente[];
  estado: Estado;
}

export interface Asistente {
  // Solo el cliente tiene asistente, y solo si hay preguntas frecuentes activas.
  disponible: boolean;
  frecuentes: PreguntaFrecuente[];
  intercambios: Intercambio[];
  menuAbierto: boolean;
  abrirMenu: () => void;
  cerrarMenu: () => void;
  elegir: (pregunta: PreguntaFrecuente) => void;
  revisar: (texto: string) => Promise<boolean>;
  resolver: (intercambio: Intercambio, pregunta: PreguntaFrecuente) => void;
  cerrar: (intercambio: Intercambio) => void;
}

export const POR_PAGINA = 4;

let siguienteId = 1;

// Con proyectoId, el menú empieza con «¿Cómo va mi obra?».
export function useAsistente(activo: boolean, proyectoId?: string): Asistente {
  const [frecuentes, setFrecuentes] = useState<PreguntaFrecuente[]>([]);
  const [intercambios, setIntercambios] = useState<Intercambio[]>([]);
  // El chat lo abre solo si todavía no hay mensajes (ver Chat.tsx).
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!activo) return;
    apiPreguntas.listar().then(({ preguntas }) => setFrecuentes(preguntas)).catch(() => {});
  }, [activo]);

  const agregar = useCallback((nuevo: Omit<Intercambio, 'id' | 'estado'>) => {
    setIntercambios((actuales) => [...actuales, { ...nuevo, id: siguienteId++, estado: 'abierto' }]);
    setMenuAbierto(false);
  }, []);

  const cambiar = useCallback((intercambio: Intercambio, estado: Estado) => {
    setIntercambios((actuales) => actuales.map((otro) => (otro.id === intercambio.id ? { ...otro, estado } : otro)));
  }, []);

  const abrirMenu = useCallback(() => setMenuAbierto(true), []);
  const cerrarMenu = useCallback(() => setMenuAbierto(false), []);

  const elegir = useCallback((pregunta: PreguntaFrecuente) => {
    if (pregunta.id !== PREGUNTA_OBRA || !proyectoId) {
      agregar({ origen: 'pregunta', texto: pregunta.pregunta, sugerencias: [pregunta] });
      return;
    }
    setMenuAbierto(false);
    respuestaDeObra(proyectoId).then((respuesta) => {
      agregar({ origen: 'pregunta', texto: pregunta.pregunta, sugerencias: [{ ...pregunta, respuesta }] });
    });
  }, [agregar, proyectoId]);

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
    // El resumen de la obra no es una pregunta frecuente: no se cuenta como resuelta.
    if (pregunta.id !== PREGUNTA_OBRA) apiPreguntas.marcarResuelta(pregunta.id).catch(() => {});
  }, [cambiar]);

  // Si la escribió, su mensaje se manda y aparece en el chat: la sugerencia ya no hace falta.
  const cerrar = useCallback((intercambio: Intercambio) => {
    if (intercambio.origen === 'sugerencia') {
      setIntercambios((actuales) => actuales.filter((otro) => otro.id !== intercambio.id));
    } else {
      cambiar(intercambio, 'cerrado');
    }
  }, [cambiar]);

  const opciones = useMemo(() => (proyectoId ? [OBRA, ...frecuentes] : frecuentes), [proyectoId, frecuentes]);

  return {
    disponible: activo && opciones.length > 0,
    frecuentes: opciones,
    intercambios,
    menuAbierto,
    abrirMenu,
    cerrarMenu,
    elegir,
    revisar,
    resolver,
    cerrar,
  };
}

const SALUDO = 'Hola, soy el asistente virtual de T Efficiency. Elige una pregunta y te respondo al momento. Si tu duda no está aquí, escríbela abajo y le llega a tu arquitecto.';
const OTRA_VEZ = '¿Qué más quieres saber? Elige otra pregunta:';

// Menú del asistente: las preguntas de 4 en 4, con flechas para avanzar y regresar.
export function MenuAsistente({ asistente, alHablar }: { asistente: Asistente; alHablar: () => void }) {
  const [pagina, setPagina] = useState(0);
  const total = Math.max(1, Math.ceil(asistente.frecuentes.length / POR_PAGINA));
  const actual = Math.min(pagina, total - 1);
  const visibles = asistente.frecuentes.slice(actual * POR_PAGINA, (actual + 1) * POR_PAGINA);

  return (
    <div className="b auto asistente" role="group" aria-label="Asistente virtual">
      <small>Asistente virtual · respuesta automática</small>
      <p className="sin-margen">{asistente.intercambios.length === 0 ? SALUDO : OTRA_VEZ}</p>
      <div className="opciones-asistente">
        {visibles.map((pregunta) => (
          <button key={pregunta.id} className="opcion" type="button" onClick={() => asistente.elegir(pregunta)}>
            {pregunta.pregunta}<span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {total > 1 && (
        <div className="paginas">
          <button className="flecha" type="button" aria-label="Preguntas anteriores" disabled={actual === 0} onClick={() => setPagina(actual - 1)}>‹</button>
          <span>{actual + 1} de {total}</span>
          <button className="flecha" type="button" aria-label="Más preguntas" disabled={actual === total - 1} onClick={() => setPagina(actual + 1)}>›</button>
        </div>
      )}
      <button className="btn s" type="button" onClick={alHablar}>Hablar con el arquitecto</button>
    </div>
  );
}

// Arriba del campo para escribir, cuando el menú está cerrado: lo vuelve a abrir.
export function BotonAsistente({ asistente }: { asistente: Asistente }) {
  if (!asistente.disponible || asistente.menuAbierto) return null;
  return (
    <button className="btn s asistente-abrir" type="button" onClick={asistente.abrirMenu}>
      Preguntar al asistente virtual
    </button>
  );
}

interface PropsRespuesta {
  intercambio: Intercambio;
  asistente: Asistente;
  // «No»: si la escribió, se manda su mensaje al arquitecto; si la eligió del menú, puede escribir.
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

// Lo que contesta: la respuesta de la pregunta elegida o las que se parecen a lo que escribió.
function Contestacion({ intercambio }: { intercambio: Intercambio }) {
  const [unica] = intercambio.sugerencias;
  if (intercambio.origen === 'pregunta') return <span className="contestacion">{unica.respuesta}</span>;
  return (
    <>
      {intercambio.sugerencias.length > 1 ? 'Quizá alguna de estas responde tu duda:' : 'Quizá esto responde tu duda:'}
      {intercambio.sugerencias.map((pregunta) => (
        <span className="sugerencia" key={pregunta.id}><b>{pregunta.pregunta}</b>{pregunta.respuesta}</span>
      ))}
    </>
  );
}

const CIERRES: Record<Exclude<Estado, 'abierto'>, string> = {
  resuelto: '¡Qué bueno! Si tienes otra duda, elige otra pregunta o escríbela aquí.',
  cerrado: 'Escribe tu duda abajo y el arquitecto te responderá aquí.',
};

function Respuesta({ intercambio, asistente, alNoResolver, ultimo }: PropsRespuesta & { ultimo: boolean }) {
  const abierto = intercambio.estado === 'abierto';
  const puedeVolver = ultimo && !abierto && asistente.disponible && !asistente.menuAbierto;
  return (
    <div className="b auto">
      <small>Asistente virtual</small>
      <Contestacion intercambio={intercambio} />
      {abierto
        ? (
          <>
            <p className="pregunta-auto">¿Esto responde tu duda?</p>
            <Acciones intercambio={intercambio} asistente={asistente} alNoResolver={alNoResolver} />
          </>
        )
        : <p className="pregunta-auto">{CIERRES[intercambio.estado as Exclude<Estado, 'abierto'>]}</p>}
      {puedeVolver && (
        <button className="btn s ver-mas" type="button" onClick={asistente.abrirMenu}>
          <span aria-hidden="true">←</span> Ver otras preguntas
        </button>
      )}
    </div>
  );
}

export function Intercambios({ asistente, alNoResolver }: Omit<PropsRespuesta, 'intercambio'>) {
  const { intercambios } = asistente;
  return (
    <>
      {intercambios.map((intercambio, indice) => (
        <div className="intercambio" key={intercambio.id}>
          <div className="b me">
            <small>Tú · {intercambio.origen === 'pregunta' ? 'pregunta al asistente' : 'sin enviar todavía'}</small>
            {intercambio.texto}
          </div>
          <Respuesta intercambio={intercambio} asistente={asistente} alNoResolver={alNoResolver} ultimo={indice === intercambios.length - 1} />
        </div>
      ))}
    </>
  );
}
