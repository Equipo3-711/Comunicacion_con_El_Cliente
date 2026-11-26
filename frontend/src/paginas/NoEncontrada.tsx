// Una dirección que no existe en el portal.
import { Link } from 'react-router';
import { Pantalla } from '../componentes/Pantalla';
import { useSesion } from '../sesion/Sesion';
import { inicioDe } from '../sesion/almacen';

export default function NoEncontrada() {
  const { usuario } = useSesion();
  return (
    <Pantalla titulo="No encontrada" className="card angosta">
      <h2>Esta página no existe</h2>
      <p className="suave">Revisa la dirección o vuelve al inicio.</p>
      <Link className="btn p" to={usuario ? inicioDe(usuario.rol) : '/'}>Ir al inicio</Link>
    </Pantalla>
  );
}
