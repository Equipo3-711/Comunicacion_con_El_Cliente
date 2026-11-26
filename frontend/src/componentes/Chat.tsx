// Chat del proyecto, solo para dudas (CC-04). Lo usan el cliente y el arquitecto.
// Muestra los mensajes, envía los nuevos y revisa cada pocos segundos si llegó otro.
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { chat } from '../api';
import { useIntervalo } from '../hooks/useIntervalo';
import { fechaCorta, hora } from '../utilidades/formatos';
import type { Mensaje, Usuario } from '../tipos';
import { Intercambios, PreguntasFrecuentes, useAsistente, type Intercambio } from './Asistente';
import { useAvisos } from './Avisos';
import { Cargando, ErrorAlCargar } from './Estados';

const CADA_CUANTO_MS = 8000;

interface Props {
  proyectoId: string;
  usuario: Usuario;
  // Se llama después de mandar un mensaje (el semáforo pudo cambiar).
  alEnviar?: () => void;
}

// Sin .at(-1): iOS 15.0 a 15.3 no lo tiene (RNF-05).
const ultimo = (lista: Mensaje[]) => lista[lista.length - 1];
const mismoUltimo = (antes: Mensaje[], ahora: Mensaje[]) => antes.length === ahora.length && ultimo(antes)?.id === ultimo(ahora)?.id;

function Burbuja({ mensaje, usuario }: { mensaje: Mensaje; usuario: Usuario }) {
  const propio = mensaje.autorId === usuario.id;
  return (
    <div className={`b ${propio ? 'me' : ''}`}>
      <small>{propio ? 'Tú' : mensaje.autor} · {fechaCorta(mensaje.creadoEn)} {hora(mensaje.creadoEn)}</small>
      {mensaje.texto}
    </div>
  );
}

export function Chat({ proyectoId, usuario, alEnviar }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const avisar = useAvisos();
  // Solo el cliente tiene respuestas automáticas a preguntas frecuentes (RF-13).
  const asistente = useAsistente(usuario.rol === 'cliente');

  // Solo se vuelve a dibujar si llegó un mensaje nuevo.
  const cargar = useCallback(async () => {
    const respuesta = await chat.mensajes(proyectoId);
    setMensajes((actuales) => (actuales && mismoUltimo(actuales, respuesta.mensajes) ? actuales : respuesta.mensajes));
  }, [proyectoId]);

  useEffect(() => {
    cargar().catch((fallo: Error) => setError(fallo));
  }, [cargar]);
  useIntervalo(() => { cargar().catch(() => {}); }, CADA_CUANTO_MS);

  useEffect(() => {
    if (lista.current) lista.current.scrollTop = lista.current.scrollHeight;
  }, [mensajes, asistente.intercambios]);

  async function mandar(limpio: string) {
    await chat.enviar(proyectoId, limpio);
    await cargar();
    alEnviar?.();
  }

  // Antes de mandar la duda del cliente, se revisa si una pregunta frecuente ya la responde.
  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    setEnviando(true);
    try {
      if (!(await asistente.revisar(limpio))) await mandar(limpio);
      setTexto('');
    } catch (fallo) {
      avisar((fallo as Error).message, 'error');
    } finally {
      setEnviando(false);
      campo.current?.focus();
    }
  }

  // «No, esto no responde mi duda»: si la escribió, se manda; si la eligió de la lista, puede escribirla.
  async function noResuelta(intercambio: Intercambio) {
    asistente.cerrar(intercambio);
    if (intercambio.origen === 'pregunta') {
      campo.current?.focus();
      return;
    }
    try {
      await mandar(intercambio.texto);
    } catch (fallo) {
      avisar((fallo as Error).message, 'error');
      setTexto(intercambio.texto);
    }
  }

  if (error) return <ErrorAlCargar error={error} />;
  return (
    <>
      <div className="msgs" ref={lista} aria-live="polite">
        {mensajes === null && <Cargando />}
        {mensajes?.length === 0 && asistente.intercambios.length === 0 && (
          <p className="vacio">Todavía no hay mensajes. Escribe tu duda y te responderemos aquí.</p>
        )}
        {mensajes?.map((mensaje) => <Burbuja key={mensaje.id} mensaje={mensaje} usuario={usuario} />)}
        <Intercambios asistente={asistente} alNoResolver={noResuelta} />
      </div>
      <PreguntasFrecuentes asistente={asistente} />
      <form className="escribir" onSubmit={enviar}>
        <label className="oculto" htmlFor="texto">Mensaje</label>
        <input
          className="in"
          id="texto"
          ref={campo}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          maxLength={1000}
          autoComplete="off"
          placeholder={usuario.rol === 'cliente' ? 'Escribe tu duda…' : 'Escribe un mensaje…'}
        />
        <button className="btn s p" type="submit" disabled={enviando}>Enviar</button>
      </form>
    </>
  );
}
