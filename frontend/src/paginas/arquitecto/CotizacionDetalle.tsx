// Detalle de una cotización para el personal: datos del formulario, fotos o planos del cliente,
// estado (Recibida, En revisión o Enviada) y el proyecto que se abrió a partir de ella.
import { useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { cotizaciones } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { SegunCarga } from '../../componentes/Estados';
import { Opciones } from '../../componentes/Formulario';
import { Pantalla } from '../../componentes/Pantalla';
import { Visor } from '../../componentes/Visor';
import { useCarga } from '../../hooks/useCarga';
import type { ArchivoCotizacion, CotizacionDetalle as Detalle, EstadoCotizacion } from '../../tipos';
import { fechaCorta, hora } from '../../utilidades/formatos';
import { ESTADOS_COTIZACION, TIPOS_CLIENTE, TIPOS_TRABAJO, nombreConEmpresa } from '../../utilidades/textos';

function Dato({ titulo, children }: { titulo: string; children: ReactNode }) {
  if (!children) return null;
  return <><dt>{titulo}</dt><dd>{children}</dd></>;
}

function Datos({ cotizacion }: { cotizacion: Detalle }) {
  const modificada = cotizacion.modificadaEn
    ? ` · el cliente la modificó el ${fechaCorta(cotizacion.modificadaEn)} a las ${hora(cotizacion.modificadaEn)}`
    : '';
  return (
    <dl className="datos mt">
      <Dato titulo="Cliente">{nombreConEmpresa(cotizacion.cliente, cotizacion.empresa)}</Dato>
      <Dato titulo="Correo">{cotizacion.correo}</Dato>
      <Dato titulo="Teléfono">{cotizacion.telefono}</Dato>
      <Dato titulo="Tipo de cliente">{TIPOS_CLIENTE[cotizacion.tipoCliente]}</Dato>
      <Dato titulo="Dirección">{cotizacion.direccion}</Dato>
      <Dato titulo="Medidas">{cotizacion.medidas}</Dato>
      <Dato titulo="Descripción">{cotizacion.descripcion}</Dato>
      <Dato titulo="Recibida">{`${fechaCorta(cotizacion.creadoEn)} a las ${hora(cotizacion.creadoEn)}${modificada}`}</Dato>
    </dl>
  );
}

function Archivos({ archivos }: { archivos: ArchivoCotizacion[] }) {
  const [abierto, setAbierto] = useState<{ archivo: Blob | null; nombre: string; error: string } | null>(null);
  const visor = useRef<HTMLDivElement>(null);

  async function ver(archivo: ArchivoCotizacion) {
    setAbierto({ archivo: null, nombre: archivo.nombre, error: '' });
    try {
      const contenido = await cotizaciones.verArchivo(archivo.id);
      setAbierto({ archivo: contenido, nombre: archivo.nombre, error: '' });
      visor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setAbierto({ archivo: null, nombre: archivo.nombre, error: (error as Error).message });
    }
  }

  return (
    <>
      <div>
        {archivos.length ? archivos.map((archivo) => (
          <div className="act" key={archivo.id}>
            <span>{archivo.nombre}</span>
            <button className="btn s" type="button" onClick={() => ver(archivo)}>Ver</button>
          </div>
        )) : <p className="vacio">El cliente no adjuntó fotos ni planos.</p>}
      </div>
      <div ref={visor}>
        {abierto && <Visor className="mt" archivo={abierto.archivo} titulo={abierto.nombre} error={abierto.error} />}
      </div>
    </>
  );
}

function CambiarEstado({ cotizacion, alGuardar }: { cotizacion: Detalle; alGuardar: () => Promise<void> }) {
  const [estado, setEstado] = useState<EstadoCotizacion>(cotizacion.estado);
  const [enviando, setEnviando] = useState(false);
  const avisar = useAvisos();

  async function guardar() {
    setEnviando(true);
    try {
      await cotizaciones.cambiarEstado(cotizacion.id, estado);
      avisar(`La cotización quedó «${ESTADOS_COTIZACION[estado]}». Le avisamos al cliente.`);
      await alGuardar();
    } catch (error) {
      avisar((error as Error).message, 'error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card">
      <h2>Estado</h2>
      <label htmlFor="nuevoEstado">Cambiar a</label>
      <select className="in" id="nuevoEstado" value={estado} onChange={(evento) => setEstado(evento.target.value as EstadoCotizacion)}>
        <Opciones textos={ESTADOS_COTIZACION} />
      </select>
      <button className="btn p" type="button" disabled={enviando} onClick={guardar}>{enviando ? 'Enviando…' : 'Guardar estado'}</button>
      <p className="suave nota">Al marcarla como «Enviada», sus solicitudes quedan atendidas. El cliente recibe el aviso en su campana.</p>
    </section>
  );
}

export default function CotizacionDetalle() {
  const { id = '' } = useParams();
  const carga = useCarga(() => cotizaciones.obtener(id), [id]);
  const cotizacion = carga.datos?.cotizacion;
  const titulo = cotizacion ? `${TIPOS_TRABAJO[cotizacion.tipoTrabajo]} · ${cotizacion.cliente}` : 'Cotización';

  return (
    <Pantalla titulo={`Cotización: ${titulo}`}>
      <p><Link to="/arquitecto#cotizaciones">← Cotizaciones recibidas</Link></p>
      <SegunCarga carga={carga}>
        {({ cotizacion: actual }) => (
          <div className="g dos-uno">
            <section className="card">
              <div className="row">
                <h1 className="pagina">{titulo}</h1>
                <span className="tag">{ESTADOS_COTIZACION[actual.estado]}</span>
              </div>
              <Datos cotizacion={actual} />
              <h2 className="mt">Fotos y planos</h2>
              <Archivos archivos={actual.archivos} />
            </section>
            <div className="g">
              <CambiarEstado key={actual.estado} cotizacion={actual} alGuardar={carga.recargar} />
              <section className="card">
                <h2>Proyecto</h2>
                {actual.proyectoId ? (
                  <>
                    <p>Esta cotización ya tiene su proyecto.</p>
                    <Link className="btn s" to={`/arquitecto/proyectos/${actual.proyectoId}`}>Ver proyecto #{actual.proyectoId}</Link>
                  </>
                ) : (
                  <>
                    <p className="suave">Cuando el cliente acepte, abre su proyecto. Queda ligado a esta cotización.</p>
                    <Link className="btn p" to={`/arquitecto?cotizacion=${actual.id}`}>Abrir proyecto</Link>
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
