// Seguimiento automático (CC-05): cómo va la obra, sin que el cliente tenga que preguntar.
// Lo arma la API con lo que registra el personal: etapa, actividades, último movimiento, pagos y garantía.
// Si no se puede cargar, no se muestra: el resto del proyecto sigue igual.
import { proyectos } from '../api';
import { useCarga } from '../hooks/useCarga';
import type { EstadoProyecto } from '../tipos';
import { ESTADOS } from '../utilidades/textos';

const ETAPAS: EstadoProyecto[] = ['cotizacion', 'en_proceso', 'en_instalacion', 'terminado'];

function Etapas({ actual }: { actual: number }) {
  return (
    <ol className="etapas" aria-label={`Etapa ${actual} de ${ETAPAS.length}`}>
      {ETAPAS.map((etapa, indice) => {
        const numero = indice + 1;
        const clase = numero < actual ? 'hecha' : numero === actual ? 'actual' : '';
        return (
          <li key={etapa} className={clase} aria-current={numero === actual ? 'step' : undefined}>
            <span className="punto" aria-hidden="true">{numero < actual ? '✓' : numero}</span>
            {ESTADOS[etapa]}
          </li>
        );
      })}
    </ol>
  );
}

export function ResumenObra({ proyectoId }: { proyectoId: string }) {
  const carga = useCarga(() => proyectos.resumen(proyectoId), [proyectoId]);
  const resumen = carga.datos?.resumen;
  if (!resumen) return null;
  const { actividades } = resumen;

  return (
    <section className="card mt resumen-obra" aria-labelledby="titulo-resumen">
      <div className="row">
        <h2 id="titulo-resumen" className="sin-margen">Seguimiento automático</h2>
        <span className="tag">Al día</span>
      </div>
      <Etapas actual={resumen.etapa.numero} />
      {actividades.total > 0 && (
        <div className="avance-obra">
          <div className="row"><small className="suave">Actividades realizadas</small><b>{actividades.realizadas} de {actividades.total}</b></div>
          <div className="barra" role="progressbar" aria-label="Actividades realizadas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={actividades.porcentaje}>
            <span style={{ width: `${actividades.porcentaje}%` }} />
          </div>
        </div>
      )}
      <ul className="puntos">
        {resumen.puntos.map((punto) => <li key={punto}>{punto}</li>)}
      </ul>
      {resumen.avisos.map((aviso) => <p className="aviso" key={aviso}>{aviso}</p>)}
      <p className="nota">Se arma solo con lo que registra tu arquitecto en el portal y se actualiza cada vez que entras.</p>
    </section>
  );
}
