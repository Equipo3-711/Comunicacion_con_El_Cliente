// Pantalla 10 · Proyecto del arquitecto: registrar actualizaciones (con fotos), cambiar el estado,
// subir documentos, marcar actividades como realizadas y editar los datos del proyecto (RF-16, RF-17).
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { actividades as apiActividades, proyectos } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { SegunCarga } from '../../componentes/Estados';
import { BotonEnviar, ErrorCampo, ErrorGeneral, claseCampo, valoresDe } from '../../componentes/Formulario';
import { Pantalla } from '../../componentes/Pantalla';
import { useCarga } from '../../hooks/useCarga';
import { useEnvio } from '../../hooks/useEnvio';
import type { Actividad, Proyecto as DatosProyecto } from '../../tipos';
import { fechaCorta, soloFecha } from '../../utilidades/formatos';
import { ESTADOS } from '../../utilidades/textos';
import { RegistrarActualizacion } from './RegistrarActualizacion';

function FilaActividad({ actividad, alMarcar }: { actividad: Actividad; alMarcar: (actividad: Actividad) => Promise<void> }) {
  const [enviando, setEnviando] = useState(false);
  async function marcar() {
    setEnviando(true);
    await alMarcar(actividad);
    setEnviando(false);
  }
  return (
    <div className="act">
      <span>{actividad.descripcion}</span>
      {actividad.realizada
        ? <span className="hecha">Realizada ✓ {fechaCorta(actividad.realizadaEn)}</span>
        : <button className="btn s" type="button" disabled={enviando} onClick={marcar}>{enviando ? 'Enviando…' : 'Marcar como realizada'}</button>}
    </div>
  );
}

// Actividades de la obra (RF-17): al marcarlas aparecen solas en el historial del cliente.
function Actividades({ proyectoId }: { proyectoId: string }) {
  const carga = useCarga(() => apiActividades.listar(proyectoId), [proyectoId]);
  const [nueva, setNueva] = useState('');
  const avisar = useAvisos();

  async function marcar(actividad: Actividad) {
    try {
      await apiActividades.marcarRealizada(actividad.id);
      avisar('Actividad publicada en el historial del cliente.');
      await carga.recargar();
    } catch (error) {
      avisar((error as Error).message, 'error');
    }
  }

  async function agregar(evento: FormEvent) {
    evento.preventDefault();
    try {
      await apiActividades.crear(proyectoId, nueva);
      setNueva('');
      await carga.recargar();
    } catch (error) {
      const fallo = error as Error & { detalles?: Record<string, string> };
      avisar(fallo.detalles?.descripcion || fallo.message, 'error');
    }
  }

  return (
    <section className="card">
      <h2>Actividades</h2>
      <div>
        <SegunCarga carga={carga}>
          {({ actividades }) => (actividades.length
            ? actividades.map((actividad) => <FilaActividad key={actividad.id} actividad={actividad} alMarcar={marcar} />)
            : <p className="vacio">Agrega las actividades de la obra, por ejemplo «Medición en obra».</p>)}
        </SegunCarga>
      </div>
      <form className="escribir mt" onSubmit={agregar}>
        <label className="oculto" htmlFor="nuevaActividad">Nueva actividad</label>
        <input className="in" id="nuevaActividad" value={nueva} onChange={(evento) => setNueva(evento.target.value)} maxLength={255} placeholder="Nueva actividad, p. ej. Instalación" />
        <button className="btn s" type="submit">Agregar</button>
      </form>
      <p className="nota">Al marcarla aparece sola en el historial del cliente, sin escribirle un mensaje.</p>
    </section>
  );
}

function DatosDelProyecto({ proyecto, alGuardar }: { proyecto: DatosProyecto; alGuardar: () => Promise<void> }) {
  const { enviando, errores, general, enviar } = useEnvio();
  const avisar = useAvisos();

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = valoresDe(evento.currentTarget);
    const listo = await enviar(() => proyectos.actualizarDatos(proyecto.id, datos));
    if (listo === undefined) return;
    avisar('Datos guardados. El cliente ya ve el presupuesto, los pagos y la garantía.');
    await alGuardar();
  }

  return (
    <section className="card">
      <h2>Datos del proyecto</h2>
      <form onSubmit={guardar} noValidate>
        <div className="g g2">
          <div><label htmlFor="presupuesto">Presupuesto (MXN)</label>
            <input className={claseCampo(errores, 'presupuesto')} id="presupuesto" name="presupuesto" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={proyecto.presupuesto ?? ''} />
            <ErrorCampo mensaje={errores.presupuesto} /></div>
          <div><label htmlFor="pagado">Pagos realizados (MXN)</label>
            <input className={claseCampo(errores, 'pagado')} id="pagado" name="pagado" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={proyecto.pagado ?? ''} />
            <ErrorCampo mensaje={errores.pagado} /></div>
        </div>
        <label htmlFor="garantiaHasta">Garantía hasta</label>
        <input className={claseCampo(errores, 'garantiaHasta')} id="garantiaHasta" name="garantiaHasta" type="date" defaultValue={soloFecha(proyecto.garantiaHasta)} />
        <ErrorCampo mensaje={errores.garantiaHasta} />
        <label htmlFor="notasInternas">Notas internas (el cliente no las ve)</label>
        <textarea className={claseCampo(errores, 'notasInternas')} id="notasInternas" name="notasInternas" maxLength={2000} defaultValue={proyecto.notasInternas ?? ''} />
        <ErrorCampo mensaje={errores.notasInternas} />
        <ErrorGeneral mensaje={general} />
        <BotonEnviar enviando={enviando} className="btn">Guardar datos</BotonEnviar>
      </form>
    </section>
  );
}

export default function Proyecto() {
  const { id = '' } = useParams();
  const carga = useCarga(() => proyectos.obtener(id), [id]);
  const [registrando, setRegistrando] = useState(false);
  const avisar = useAvisos();

  async function alPublicar() {
    setRegistrando(false);
    avisar('Publicado. El cliente lo ve en su historial y en su campana.');
    await carga.recargar();
  }

  return (
    <Pantalla titulo={carga.datos?.proyecto.nombre ?? 'Proyecto'}>
      <SegunCarga carga={carga}>
        {({ proyecto }) => (
          <>
            <div className="row titulo-pagina envolver">
              <div>
                <small className="suave">{proyecto.empresa} · Proyecto #{proyecto.id}</small>
                <h1 className="pagina">{proyecto.nombre}</h1>
                <span className="tag">{ESTADOS[proyecto.estado]}</span>
              </div>
              <button className="btn y s" type="button" aria-expanded={registrando} onClick={() => setRegistrando(!registrando)}>
                Registrar actualización
              </button>
            </div>

            {registrando && <RegistrarActualizacion proyectoId={id} estadoActual={proyecto.estado} alGuardar={alPublicar} />}

            <div className="g g2 arriba">
              <Actividades proyectoId={id} />
              <DatosDelProyecto key={JSON.stringify(proyecto)} proyecto={proyecto} alGuardar={carga.recargar} />
            </div>

            <div className="row mt envolver">
              <Link to="/arquitecto">Volver</Link>
              <Link to={`/arquitecto/proyectos/${id}/chat`}>Abrir chat</Link>
              <Link to={`/cliente/proyectos/${id}`}>Ver historial del cliente →</Link>
            </div>
          </>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
