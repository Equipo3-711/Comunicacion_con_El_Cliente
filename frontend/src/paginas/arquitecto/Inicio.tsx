// Pantalla 9 · Inicio del arquitecto: clientes con su semáforo, alta de clientes y cotizaciones recibidas.
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { cotizaciones as apiCotizaciones, proyectos as apiProyectos, solicitudes as apiSolicitudes } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { SegunCarga } from '../../componentes/Estados';
import { Pantalla } from '../../componentes/Pantalla';
import { useIrAlAncla } from '../../hooks/useAvisoDeLlegada';
import { useCarga } from '../../hooks/useCarga';
import { useUsuario } from '../../sesion/Sesion';
import type { Cotizacion, Proyecto, Solicitud } from '../../tipos';
import { fechaCorta, iniciales } from '../../utilidades/formatos';
import { ATENCION, ESTADOS_COTIZACION, TIPOS_CLIENTE, TIPOS_TRABAJO } from '../../utilidades/textos';
import { AgregarCliente } from './AgregarCliente';

function FilaCliente({ proyecto }: { proyecto: Proyecto }) {
  const nombre = proyecto.cliente || proyecto.empresa;
  return (
    <div className="act">
      <Link className="persona" to={`/arquitecto/proyectos/${proyecto.id}`}>
        <span className="av">{iniciales(nombre)}</span>
        <div><b>{nombre}</b><small>Proyecto #{proyecto.id} · {proyecto.nombre}</small></div>
      </Link>
      <div className="acciones">
        <Link className="btn s" to={`/arquitecto/proyectos/${proyecto.id}/chat`}>Chat</Link>
        <span className={`dot ${proyecto.atencion}`} title={ATENCION[proyecto.atencion]} aria-label={ATENCION[proyecto.atencion]} role="img" />
      </div>
    </div>
  );
}

function FilaCotizacion({ registro, alAbrirProyecto }: { registro: Cotizacion; alAbrirProyecto: () => void }) {
  const archivos = registro.archivos ? ` (${registro.archivos} archivo${registro.archivos > 1 ? 's' : ''})` : '';
  return (
    <div className="act">
      <div>
        <b>{registro.cliente} · {registro.empresa}</b>{' '}
        <span className="tag">{ESTADOS_COTIZACION[registro.estado]}</span>{' '}
        {registro.modificadaEn && <span className="tag pendiente">Modificada</span>}<br />
        <small className="suave">
          {TIPOS_TRABAJO[registro.tipoTrabajo]} · {TIPOS_CLIENTE[registro.tipoCliente]} · {registro.direccion} · {registro.telefono} · {fechaCorta(registro.creadoEn)}
        </small>
        <p className="descripcion">{registro.descripcion}{registro.medidas && <>{' '}<small className="suave">({registro.medidas})</small></>}</p>
      </div>
      <div className="acciones">
        <Link className="btn s" to={`/arquitecto/cotizaciones/${registro.id}`}>Ver{archivos}</Link>
        {registro.proyectoId
          ? <Link className="btn s" to={`/arquitecto/proyectos/${registro.proyectoId}`}>Proyecto #{registro.proyectoId}</Link>
          : <button className="btn s" type="button" onClick={alAbrirProyecto}>Abrir proyecto</button>}
      </div>
    </div>
  );
}

// Las que siguen abiertas y son del usuario o de nadie.
function porAtender(solicitudes: Solicitud[], usuarioId: number): number {
  return solicitudes.filter((solicitud) => solicitud.estado !== 'atendida'
    && (solicitud.responsableId === null || solicitud.responsableId === usuarioId)).length;
}

export default function Inicio() {
  const usuario = useUsuario();
  const avisar = useAvisos();
  const [parametros, setParametros] = useSearchParams();
  const [soloDudas, setSoloDudas] = useState(false);
  const [dialogo, setDialogo] = useState<{ cotizacion: Cotizacion | null } | null>(null);
  const lista = useRef<HTMLDivElement>(null);

  const carga = useCarga(async () => {
    const [{ proyectos }, { cotizaciones }] = await Promise.all([apiProyectos.listar(), apiCotizaciones.listar()]);
    return { proyectos, cotizaciones };
  }, []);
  const solicitudes = useCarga(() => apiSolicitudes.listar(), []);
  useIrAlAncla(carga.datos !== null);

  // Desde el detalle de una cotización: «Abrir proyecto» llega aquí con ?cotizacion=ID.
  const idCotizacion = parametros.get('cotizacion');
  useEffect(() => {
    if (!idCotizacion || !carga.datos) return;
    const elegida = carga.datos.cotizaciones.find((registro) => String(registro.id) === idCotizacion && !registro.proyectoId);
    if (elegida) setDialogo({ cotizacion: elegida });
    setParametros({}, { replace: true });
  }, [idCotizacion, carga.datos, setParametros]);

  function verDudas() {
    setSoloDudas(true);
    lista.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function alGuardar() {
    setDialogo(null);
    avisar('Listo: el cliente ya está en tu cartera.');
    await carga.recargar();
  }

  const proyectos = carga.datos?.proyectos ?? [];
  const conDudas = proyectos.filter((proyecto) => proyecto.atencion === 'no_atendido').length;
  const visibles = soloDudas ? proyectos.filter((proyecto) => proyecto.atencion !== 'atendido') : proyectos;
  const numSolicitudes = solicitudes.datos ? porAtender(solicitudes.datos.solicitudes, usuario.id) : 0;

  return (
    <Pantalla titulo="Mis clientes">
      <SegunCarga carga={carga}>
        {({ cotizaciones }) => (
          <>
            <div className="g dos-uno">
              <section className="card" ref={lista}>
                <div className="row">
                  <h2>Mis clientes</h2>
                  <label className="filtro"><input type="checkbox" checked={soloDudas} onChange={(evento) => setSoloDudas(evento.target.checked)} /> Solo con dudas</label>
                </div>
                <div>
                  {visibles.length
                    ? visibles.map((proyecto) => <FilaCliente key={proyecto.id} proyecto={proyecto} />)
                    : <p className="vacio">{soloDudas ? 'No hay dudas sin atender.' : 'Todavía no tienes clientes. Usa «Agregar usuario».'}</p>}
                </div>
                <p className="ttl leyenda">
                  <span><span className="dot no_atendido" />No atendido</span>
                  <span><span className="dot pendiente" />Pendiente</span>
                  <span><span className="dot atendido" />Atendido</span>
                </p>
              </section>
              <div className="g mosaicos">
                <button className="gi" type="button" onClick={() => setDialogo({ cotizacion: null })}>
                  <h3>Agregar usuario</h3><p>Asigna un cliente a tu cartera</p>
                </button>
                <button className="gi" type="button" onClick={verDudas}>
                  <h3>Dudas y preguntas</h3><p>Chat con los clientes</p>
                  {conDudas > 0 && <b>{conDudas} sin atender</b>}
                </button>
                <Link className="gi" to="/arquitecto/solicitudes">
                  <h3>Solicitudes</h3><p>WhatsApp, llamadas, redes, correo y portal</p>
                  {numSolicitudes > 0 && <b>{numSolicitudes} por atender</b>}
                </Link>
                <Link className="gi" to="/arquitecto/preguntas">
                  <h3>Preguntas frecuentes</h3><p>Respuestas automáticas del chat</p>
                </Link>
              </div>
            </div>

            <section className="card mt" id="cotizaciones">
              <h2>Cotizaciones recibidas</h2>
              <div>
                {cotizaciones.length
                  ? cotizaciones.map((registro) => (
                    <FilaCotizacion key={registro.id} registro={registro} alAbrirProyecto={() => setDialogo({ cotizacion: registro })} />
                  ))
                  : <p className="vacio">No hay cotizaciones.</p>}
              </div>
            </section>
          </>
        )}
      </SegunCarga>
      <AgregarCliente abierto={dialogo !== null} cotizacion={dialogo?.cotizacion ?? null} alCerrar={() => setDialogo(null)} alGuardar={alGuardar} />
    </Pantalla>
  );
}
