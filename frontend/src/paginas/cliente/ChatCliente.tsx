// Pantalla 7 · Chat del cliente con el arquitecto responsable de su proyecto.
import { Link, useParams } from 'react-router';
import { proyectos } from '../../api';
import { Chat } from '../../componentes/Chat';
import { SegunCarga } from '../../componentes/Estados';
import { Pantalla } from '../../componentes/Pantalla';
import { useCarga } from '../../hooks/useCarga';
import { useUsuario } from '../../sesion/Sesion';
import { iniciales } from '../../utilidades/formatos';

export default function ChatCliente() {
  const { id = '' } = useParams();
  const usuario = useUsuario();
  const carga = useCarga(() => proyectos.obtener(id), [id]);

  return (
    <Pantalla titulo="Chat del proyecto" className="card media chat">
      <SegunCarga carga={carga}>
        {({ proyecto }) => (
          <>
            <div className="row">
              <div className="row inicio">
                <span className="av">{iniciales(proyecto.responsable)}</span>
                <div>
                  <h3>{proyecto.responsable}</h3>
                  <small className="suave">{proyecto.nombre} · Solo para dudas</small>
                </div>
              </div>
              <Link to={`/cliente/proyectos/${id}`}>Volver al proyecto</Link>
            </div>
            <Chat proyectoId={id} usuario={usuario} />
            <p className="nota">El chat es solo para dudas. Los avances de tu obra aparecen en el historial del proyecto.</p>
          </>
        )}
      </SegunCarga>
    </Pantalla>
  );
}
