// Pantalla 11 · Chat del arquitecto con el cliente, con el semáforo de atención.
import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { proyectos } from '../../api';
import { useAvisos } from '../../componentes/Avisos';
import { Chat } from '../../componentes/Chat';
import { SegunCarga } from '../../componentes/Estados';
import { Pantalla } from '../../componentes/Pantalla';
import { useCarga } from '../../hooks/useCarga';
import { useUsuario } from '../../sesion/Sesion';
import type { Atencion } from '../../tipos';
import { iniciales } from '../../utilidades/formatos';
import { ATENCION } from '../../utilidades/textos';

export default function ChatArquitecto() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const avisar = useAvisos();
  const carga = useCarga(async () => {
    const [{ proyecto }, { proyectos: todos }] = await Promise.all([proyectos.obtener(id), proyectos.listar()]);
    const cliente = todos.find((registro) => String(registro.id) === id)?.cliente || proyecto.empresa;
    return { proyecto, cliente };
  }, [id]);
  const { recargar } = carga;

  // Después de responder, el semáforo pudo cambiar solo: se vuelve a leer.
  const alEnviar = useCallback(() => { recargar(); }, [recargar]);

  async function marcar(atencion: Atencion) {
    try {
      await proyectos.cambiarAtencion(id, atencion);
      avisar(`Marcado como «${ATENCION[atencion]}».`);
      await recargar();
    } catch (error) {
      avisar((error as Error).message, 'error');
    }
  }

  return (
    <Pantalla
      titulo={carga.datos ? `Chat con ${carga.datos.cliente}` : 'Chat con el cliente'}
      className="g dos-uno chat"
      regresar={{ a: `/arquitecto/proyectos/${id}`, texto: 'Proyecto' }}
    >
      <SegunCarga carga={carga}>
        {({ proyecto, cliente }) => (
          <>
            <section className="card">
              <div className="row">
                <div className="row inicio">
                  <span className="av">{iniciales(cliente)}</span>
                  <div><h3>{cliente}</h3><small className="suave">Proyecto #{proyecto.id} · {proyecto.nombre}</small></div>
                </div>
                <Link to={`/arquitecto/proyectos/${id}`}>Detalles del proyecto</Link>
              </div>
              <Chat proyectoId={id} usuario={usuario} alEnviar={alEnviar} />
            </section>
            <section className="card g semaforo">
              <h3>Estado</h3>
              <div className="g estados" role="group" aria-label="Estado de atención">
                {(Object.keys(ATENCION) as Atencion[]).map((atencion) => (
                  <button key={atencion} className="btn" type="button" aria-pressed={proyecto.atencion === atencion} onClick={() => marcar(atencion)}>
                    <span className={`dot ${atencion}`} /> {ATENCION[atencion]}
                  </button>
                ))}
              </div>
              <p className="nota">Cambia solo: una duda nueva lo deja en «No atendido» y tu respuesta, en «Pendiente». Márcalo como «Atendido» cuando la duda quede resuelta.</p>
            </section>
          </>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
