// Bandeja de solicitudes del personal: todo lo que piden los clientes, llegue por donde llegue (RF-01),
// con su categoría (RF-04), su responsable (RF-05) y su estado.
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { solicitudes as apiSolicitudes } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { SegunCarga } from '../../componentes/Estados';
import { Opciones } from '../../componentes/Formulario';
import { Pantalla } from '../../componentes/Pantalla';
import { useCarga } from '../../hooks/useCarga';
import { useUsuario } from '../../sesion/Sesion';
import type { CambiosSolicitud, FiltrosSolicitudes, Solicitud } from '../../tipos';
import { fechaCorta, hora } from '../../utilidades/formatos';
import { CANALES, CATEGORIAS, ESTADOS_SOLICITUD } from '../../utilidades/textos';
import { RegistrarSolicitud } from './RegistrarSolicitud';

const RESPONSABLE_FILTRO = { yo: 'Mías', sin_asignar: 'Sin asignar' };

function QuienPide({ solicitud }: { solicitud: Solicitud }) {
  return (
    <>
      <b>{solicitud.contacto}</b>
      {solicitud.empresa && solicitud.empresa !== solicitud.contacto && ` · ${solicitud.empresa}`}
      {!solicitud.clienteId && <small className="suave"> (sin cuenta)</small>}
    </>
  );
}

function Detalles({ solicitud }: { solicitud: Solicitud }) {
  return (
    <small className="suave">
      #{solicitud.id} · {fechaCorta(solicitud.creadoEn)} · {hora(solicitud.creadoEn)}
      {solicitud.telefono && ` · ${solicitud.telefono}`}
      {solicitud.proyectoId && <> · <Link to={`/arquitecto/proyectos/${solicitud.proyectoId}`}>{solicitud.proyecto}</Link></>}
      {solicitud.cotizacionId && <> · <Link to={`/arquitecto/cotizaciones/${solicitud.cotizacionId}`}>Ver cotización</Link></>}
      {solicitud.registradaPorId !== solicitud.clienteId && ` · Registró: ${solicitud.registradaPor}`}
    </small>
  );
}

interface PropsFila {
  solicitud: Solicitud;
  responsables: Record<number, string>;
  alCambiar: (solicitud: Solicitud, cambios: CambiosSolicitud) => Promise<void>;
}

// Cada cambio se guarda en cuanto se elige.
function FilaSolicitud({ solicitud, responsables, alCambiar }: PropsFila) {
  const [guardando, setGuardando] = useState(false);

  async function cambiar(campo: keyof CambiosSolicitud, valor: string) {
    setGuardando(true);
    await alCambiar(solicitud, { [campo]: valor });
    setGuardando(false);
  }

  const control = (campo: keyof CambiosSolicitud, textos: Record<string | number, string>, valor: string) => (
    <select className="in chico" value={valor} disabled={guardando} onChange={(evento) => cambiar(campo, evento.target.value)}>
      {!valor && <option value="" disabled>Sin asignar</option>}
      <Opciones textos={textos} />
    </select>
  );

  return (
    <article className="act sol">
      <div>
        <QuienPide solicitud={solicitud} />{' '}
        <span className={`tag ${solicitud.estado}`}>{ESTADOS_SOLICITUD[solicitud.estado]}</span>{' '}
        <span className="tag">{CANALES[solicitud.canal]}</span><br />
        <Detalles solicitud={solicitud} />
        <p>{solicitud.descripcion}</p>
      </div>
      <div className="controles">
        <label>Categoría {control('categoria', CATEGORIAS, solicitud.categoria)}</label>
        <label>Responsable {control('responsableId', responsables, solicitud.responsableId ? String(solicitud.responsableId) : '')}</label>
        <label>Estado {control('estado', ESTADOS_SOLICITUD, solicitud.estado)}</label>
      </div>
    </article>
  );
}

function Filtros({ filtros, alCambiar }: { filtros: FiltrosSolicitudes; alCambiar: (filtros: FiltrosSolicitudes) => void }) {
  const filtro = (nombre: keyof FiltrosSolicitudes, etiqueta: string, textos: Record<string, string>, todos: string) => (
    <label>{etiqueta}
      <select className="in" name={nombre} value={filtros[nombre] ?? ''} onChange={(evento) => alCambiar({ ...filtros, [nombre]: evento.target.value })}>
        <Opciones textos={textos} vacia={todos} />
      </select>
    </label>
  );
  return (
    <form className="filtros" aria-label="Filtros" onSubmit={(evento) => evento.preventDefault()}>
      {filtro('estado', 'Estado', ESTADOS_SOLICITUD, 'Todos')}
      {filtro('categoria', 'Categoría', CATEGORIAS, 'Todas')}
      {filtro('canal', 'Canal', CANALES, 'Todos')}
      {filtro('responsable', 'Responsable', RESPONSABLE_FILTRO, 'Todos')}
    </form>
  );
}

export default function Solicitudes() {
  useUsuario();
  const avisar = useAvisos();
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({});
  const [registrando, setRegistrando] = useState(false);
  const responsablesCarga = useCarga(() => apiSolicitudes.responsables(), []);
  const carga = useCarga(() => apiSolicitudes.listar(filtros), [filtros]);

  const responsables = useMemo(
    () => Object.fromEntries((responsablesCarga.datos?.responsables ?? []).map((persona) => [persona.id, persona.nombre])),
    [responsablesCarga.datos],
  );

  // Si falla, se vuelve a dibujar la bandeja como estaba.
  async function cambiar(solicitud: Solicitud, cambios: CambiosSolicitud) {
    try {
      await apiSolicitudes.actualizar(solicitud.id, cambios);
      avisar('Solicitud actualizada.');
    } catch (error) {
      avisar((error as Error).message, 'error');
    }
    await carga.recargar();
  }

  async function alGuardar() {
    setRegistrando(false);
    avisar('Solicitud registrada.');
    await carga.recargar();
  }

  return (
    <Pantalla titulo="Solicitudes">
      <p><Link to="/arquitecto">← Mis clientes</Link></p>
      <div className="row titulo-pagina amplio">
        <h1 className="pagina">Solicitudes</h1>
        <button className="btn p auto" type="button" onClick={() => setRegistrando(true)}>＋ Registrar solicitud</button>
      </div>
      <section className="card">
        <Filtros filtros={filtros} alCambiar={setFiltros} />
        <SegunCarga carga={carga}>
          {({ solicitudes }) => {
            const sinAtender = solicitudes.filter((solicitud) => solicitud.estado !== 'atendida').length;
            return (
              <>
                <p className="suave">{solicitudes.length} solicitud(es) · {sinAtender} sin atender</p>
                <div>
                  {solicitudes.length
                    ? solicitudes.map((solicitud) => (
                      <FilaSolicitud key={solicitud.id} solicitud={solicitud} responsables={responsables} alCambiar={cambiar} />
                    ))
                    : <p className="vacio">No hay solicitudes con estos filtros.</p>}
                </div>
              </>
            );
          }}
        </SegunCarga>
      </section>
      <RegistrarSolicitud abierto={registrando} responsables={responsables} alCerrar={() => setRegistrando(false)} alGuardar={alGuardar} />
    </Pantalla>
  );
}
