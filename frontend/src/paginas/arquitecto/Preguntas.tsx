// Preguntas frecuentes del chat (RF-13): el personal escribe cada pregunta, su respuesta y sus palabras clave.
// El chat del cliente las ofrece antes de escribir y las sugiere cuando su duda tiene alguna palabra clave.
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { preguntas as apiPreguntas } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { Dialogo } from '../../componentes/Dialogo';
import { SegunCarga } from '../../componentes/Estados';
import { BotonEnviar, ErrorCampo, ErrorGeneral, claseCampo, valoresDe } from '../../componentes/Formulario';
import { Pantalla } from '../../componentes/Pantalla';
import { useCarga } from '../../hooks/useCarga';
import { useEnvio } from '../../hooks/useEnvio';
import type { DatosPregunta, PreguntaFrecuente } from '../../tipos';

function datosDe(pregunta: PreguntaFrecuente, cambios: Partial<DatosPregunta> = {}): DatosPregunta {
  return {
    pregunta: pregunta.pregunta,
    respuesta: pregunta.respuesta,
    palabrasClave: pregunta.palabrasClave ?? '',
    activa: pregunta.activa ?? true,
    ...cambios,
  };
}

interface PropsFila {
  pregunta: PreguntaFrecuente;
  alEditar: (pregunta: PreguntaFrecuente) => void;
  alCambiar: () => Promise<void>;
}

function FilaPregunta({ pregunta, alEditar, alCambiar }: PropsFila) {
  const avisar = useAvisos();
  const [ocupada, setOcupada] = useState(false);

  async function hacer(trabajo: () => Promise<unknown>, aviso: string) {
    setOcupada(true);
    try {
      await trabajo();
      avisar(aviso);
      await alCambiar();
    } catch (error) {
      avisar((error as Error).message, 'error');
    } finally {
      setOcupada(false);
    }
  }

  const encender = () => hacer(
    () => apiPreguntas.actualizar(pregunta.id, datosDe(pregunta, { activa: !pregunta.activa })),
    pregunta.activa ? 'Pregunta apagada: el chat ya no la ofrece.' : 'Pregunta encendida: el chat ya la ofrece.',
  );
  function borrar() {
    if (!window.confirm(`¿Borrar «${pregunta.pregunta}»? No se puede deshacer.`)) return;
    hacer(() => apiPreguntas.eliminar(pregunta.id), 'Pregunta borrada.');
  }

  return (
    <article className="act sol">
      <div>
        <b>{pregunta.pregunta}</b>{' '}
        <span className={`tag ${pregunta.activa ? 'atendida' : ''}`}>{pregunta.activa ? 'Activa' : 'Apagada'}</span><br />
        <small className="suave">Resolvió {pregunta.resueltas ?? 0} duda(s) · Palabras clave: {pregunta.palabrasClave}</small>
        <p>{pregunta.respuesta}</p>
      </div>
      <div className="acciones">
        <button className="btn s" type="button" disabled={ocupada} onClick={() => alEditar(pregunta)}>Editar</button>
        <button className="btn s" type="button" disabled={ocupada} onClick={encender}>{pregunta.activa ? 'Apagar' : 'Encender'}</button>
        <button className="btn s" type="button" disabled={ocupada} onClick={borrar}>Borrar</button>
      </div>
    </article>
  );
}

function FormularioPregunta({ existente, alGuardar }: { existente: PreguntaFrecuente | null; alGuardar: () => void }) {
  const { enviando, errores, general, enviar } = useEnvio();

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const valores = valoresDe(evento.currentTarget);
    const datos: DatosPregunta = {
      pregunta: valores.pregunta ?? '',
      respuesta: valores.respuesta ?? '',
      palabrasClave: valores.palabrasClave ?? '',
      activa: valores.activa === 'si',
    };
    const listo = await enviar(() => (existente ? apiPreguntas.actualizar(existente.id, datos) : apiPreguntas.crear(datos)));
    if (listo !== undefined) alGuardar();
  }

  return (
    <form className="mt" onSubmit={guardar} noValidate>
      <label htmlFor="pregunta">Pregunta <i>*</i></label>
      <input className={claseCampo(errores, 'pregunta')} id="pregunta" name="pregunta" maxLength={200} placeholder="¿Cuánto tarda la instalación?" defaultValue={existente?.pregunta} />
      <ErrorCampo mensaje={errores.pregunta} />

      <label htmlFor="respuesta">Respuesta <i>*</i> (el cliente la ve tal cual)</label>
      <textarea className={claseCampo(errores, 'respuesta')} id="respuesta" name="respuesta" maxLength={1000} placeholder="Unas ventanas se instalan en 1 o 2 días…" defaultValue={existente?.respuesta} />
      <ErrorCampo mensaje={errores.respuesta} />

      <label htmlFor="palabrasClave">Palabras clave <i>*</i> (separadas por comas; no importan acentos ni mayúsculas)</label>
      <input className={claseCampo(errores, 'palabrasClave')} id="palabrasClave" name="palabrasClave" maxLength={300} placeholder="cuánto tarda, instalación, fecha" defaultValue={existente?.palabrasClave} />
      <ErrorCampo mensaje={errores.palabrasClave} />

      <label className="filtro">
        <input type="checkbox" name="activa" value="si" defaultChecked={existente?.activa ?? true} /> Activa: el chat la ofrece y la sugiere
      </label>

      <ErrorGeneral mensaje={general} />
      <BotonEnviar enviando={enviando} className="btn p mt">{existente ? 'Guardar cambios' : 'Agregar pregunta'}</BotonEnviar>
    </form>
  );
}

export default function Preguntas() {
  const avisar = useAvisos();
  const carga = useCarga(() => apiPreguntas.listar(), []);
  // null: cerrado; { existente: null }: agregar; { existente }: editar.
  const [dialogo, setDialogo] = useState<{ existente: PreguntaFrecuente | null } | null>(null);

  async function alGuardar() {
    avisar(dialogo?.existente ? 'Pregunta guardada.' : 'Pregunta agregada: el chat ya la ofrece.');
    setDialogo(null);
    await carga.recargar();
  }

  return (
    <Pantalla titulo="Preguntas frecuentes">
      <p><Link to="/arquitecto">← Mis clientes</Link></p>
      <div className="row titulo-pagina amplio">
        <h1 className="pagina">Preguntas frecuentes</h1>
        <button className="btn p auto" type="button" onClick={() => setDialogo({ existente: null })}>＋ Agregar pregunta</button>
      </div>
      <section className="card">
        <p className="suave sin-margen">
          El chat del cliente muestra las preguntas activas antes de escribir. Si su duda tiene alguna palabra clave, le sugiere
          la respuesta y le pregunta si resolvió su duda; si no, su mensaje te llega como siempre. Las respuestas salen tal cual
          las escribes aquí.
        </p>
        <SegunCarga carga={carga}>
          {({ preguntas }) => (
            <div className="mt">
              {preguntas.length
                ? preguntas.map((pregunta) => (
                  <FilaPregunta key={pregunta.id} pregunta={pregunta} alEditar={(elegida) => setDialogo({ existente: elegida })} alCambiar={carga.recargar} />
                ))
                : <p className="vacio">Todavía no hay preguntas frecuentes. Agrega la primera.</p>}
            </div>
          )}
        </SegunCarga>
      </section>
      <Dialogo abierto={dialogo !== null} alCerrar={() => setDialogo(null)} titulo={dialogo?.existente ? 'Editar pregunta' : 'Agregar pregunta'}>
        <FormularioPregunta key={dialogo?.existente?.id ?? 'nueva'} existente={dialogo?.existente ?? null} alGuardar={alGuardar} />
      </Dialogo>
    </Pantalla>
  );
}
