// Pantalla 5 · Detalles del proyecto: presupuesto, pagos, garantía, historial y documentos (RF-08).
// El arquitecto también puede abrirla para ver lo mismo que ve su cliente.
import { Link, useParams } from 'react-router';
import { proyectos } from '../../api';
import { SegunCarga } from '../../componentes/Estados';
import { Historial } from '../../componentes/Historial';
import { Pantalla } from '../../componentes/Pantalla';
import { ResumenObra } from '../../componentes/ResumenObra';
import { useCarga } from '../../hooks/useCarga';
import { useUsuario } from '../../sesion/Sesion';
import { dinero, fechaCorta, mesYAnio } from '../../utilidades/formatos';
import { ESTADOS } from '../../utilidades/textos';

export default function ProyectoDetalle() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const esArquitecto = usuario.rol === 'admin';
  const carga = useCarga(async () => {
    const [{ proyecto }, { documentos }] = await Promise.all([proyectos.obtener(id), proyectos.documentos(id)]);
    return { proyecto, documentos };
  }, [id]);

  return (
    <Pantalla
      titulo={carga.datos?.proyecto.nombre ?? 'Proyecto'}
      regresar={esArquitecto ? { a: `/arquitecto/proyectos/${id}`, texto: 'Vista del arquitecto' } : { a: '/cliente', texto: 'Mis proyectos' }}
    >
      <SegunCarga carga={carga}>
        {({ proyecto, documentos }) => (
          <>
            {esArquitecto && (
              <p className="aviso">
                Estás viendo el proyecto tal como lo ve el cliente.{' '}
                <Link to={`/arquitecto/proyectos/${id}`}>Volver a la vista del arquitecto</Link>
              </p>
            )}
            <div className="row titulo-pagina">
              <h1 className="pagina">{proyecto.nombre}</h1>
              <span className="tag">{ESTADOS[proyecto.estado]}</span>
            </div>
            <div className="g g3">
              <div className="card"><small className="suave">Presupuesto</small><h3>{dinero(proyecto.presupuesto)}</h3></div>
              <div className="card"><small className="suave">Pagos realizados</small><h3>{dinero(proyecto.pagado)}</h3></div>
              <div className="card">
                <small className="suave">Garantía</small>
                <h3 className="ok">{proyecto.garantiaHasta ? `Hasta ${mesYAnio(proyecto.garantiaHasta)}` : 'Por definir'}</h3>
              </div>
            </div>
            <ResumenObra proyectoId={id} />
            <section className="card mt">
              <h2>Historial del proyecto</h2>
              <div><Historial proyectoId={id} /></div>
            </section>
            <section className="card mt">
              <h2>Documentos</h2>
              <div>
                {documentos.length ? documentos.map((documento) => (
                  <div className="act" key={documento.id}>
                    <span>{documento.nombre} <small className="suave">· {fechaCorta(documento.creadoEn)}</small></span>
                    <Link className="btn s" to={`/cliente/proyectos/${id}/documentos/${documento.id}`}>Ver</Link>
                  </div>
                )) : <p className="vacio">Todavía no hay documentos.</p>}
              </div>
            </section>
            <Link className="btn mt" to={esArquitecto ? `/arquitecto/proyectos/${id}/chat` : `/cliente/proyectos/${id}/chat`}>
              ¿Tienes una duda? Abrir chat
            </Link>
          </>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
