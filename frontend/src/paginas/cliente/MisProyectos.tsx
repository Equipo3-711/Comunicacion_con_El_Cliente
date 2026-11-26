// Pantalla 3 · Mis proyectos del cliente, con su semáforo y sus cotizaciones enviadas.
import { Link } from 'react-router';
import { cotizaciones as apiCotizaciones, proyectos as apiProyectos } from '../../api';
import { SegunCarga } from '../../componentes/Estados';
import { Pantalla } from '../../componentes/Pantalla';
import { useAvisoDeLlegada, useIrAlAncla } from '../../hooks/useAvisoDeLlegada';
import { useCarga } from '../../hooks/useCarga';
import { useUsuario } from '../../sesion/Sesion';
import type { Cotizacion, Proyecto } from '../../tipos';
import { fechaCorta } from '../../utilidades/formatos';
import { ESTADOS, ESTADOS_COTIZACION, TIPOS_TRABAJO } from '../../utilidades/textos';

// Para el cliente, el semáforo solo dice si su duda ya se atendió o sigue pendiente.
function TarjetaProyecto({ proyecto }: { proyecto: Proyecto }) {
  const atendido = proyecto.atencion === 'atendido';
  return (
    <article className="card g">
      <div className="row">
        <h3>{proyecto.nombre}</h3>
        <span className={`tag ${atendido ? 'atendido' : 'pendiente'}`}>{atendido ? 'Atendido' : 'Pendiente'}</span>
      </div>
      <small className="suave">{ESTADOS[proyecto.estado]} · Última actualización: {fechaCorta(proyecto.ultimaActualizacion)}</small>
      <div><Link className="btn s" to={`/cliente/proyectos/${proyecto.id}`}>Ver proyecto</Link></div>
    </article>
  );
}

// El cliente puede pedir cambios a su cotización mientras no tenga proyecto (RF-11).
function FilaCotizacion({ registro }: { registro: Cotizacion }) {
  return (
    <div className="act">
      <div>
        <b>{TIPOS_TRABAJO[registro.tipoTrabajo]} · {registro.direccion}</b><br />
        <small className="suave">
          Enviada el {fechaCorta(registro.creadoEn)}
          {registro.modificadaEn && ` · Modificada el ${fechaCorta(registro.modificadaEn)}`}
          {registro.archivos > 0 && ` · ${registro.archivos} archivo(s)`}
        </small>
      </div>
      <div className="acciones">
        <span className="tag">{ESTADOS_COTIZACION[registro.estado]}</span>
        {!registro.proyectoId && <Link className="btn s" to={`/cliente/cotizacion/${registro.id}`}>Modificar</Link>}
      </div>
    </div>
  );
}

export default function MisProyectos() {
  const usuario = useUsuario();
  useAvisoDeLlegada({
    enviada: 'Recibimos tu solicitud de cotización. Te avisaremos en la campana.',
    modificada: 'Recibimos el cambio a tu cotización. La revisaremos de nuevo.',
    bienvenida: `Bienvenida o bienvenido, ${usuario.nombre}. Ya puedes cotizar tu proyecto.`,
  });
  const carga = useCarga(async () => {
    const [{ proyectos }, { cotizaciones }] = await Promise.all([apiProyectos.listar(), apiCotizaciones.listar()]);
    return { proyectos, cotizaciones };
  }, []);
  useIrAlAncla(carga.datos !== null);

  return (
    <Pantalla titulo="Mis proyectos">
      <h1 className="pagina">Mis proyectos</h1>
      <SegunCarga carga={carga}>
        {({ proyectos, cotizaciones }) => (
          <>
            <div className="g g2">
              {proyectos.length
                ? proyectos.map((proyecto) => <TarjetaProyecto key={proyecto.id} proyecto={proyecto} />)
                : <p className="vacio">Todavía no tienes proyectos. Solicita una cotización y, cuando la aprobemos, tu proyecto aparecerá aquí.</p>}
            </div>
            <Link className="btn y grande" to="/cliente/cotizacion">＋ Cotizar nuevo proyecto</Link>
            {cotizaciones.length > 0 && (
              <section className="card mt" id="cotizaciones">
                <h2>Mis cotizaciones</h2>
                <div>{cotizaciones.map((registro) => <FilaCotizacion key={registro.id} registro={registro} />)}</div>
              </section>
            )}
          </>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
