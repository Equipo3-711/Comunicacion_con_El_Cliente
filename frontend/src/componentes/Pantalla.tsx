// Marco de cada pantalla: encabezado, flecha para regresar, contenido y el título de la pestaña.
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Encabezado } from './Encabezado';

export interface Regreso {
  a: string;
  texto: string;
}

interface Props {
  titulo: string;
  children: ReactNode;
  className?: string;
  // A dónde lleva la flecha «←». Las pantallas de inicio no la llevan.
  regresar?: Regreso;
}

// La flecha se alinea con el contenido cuando la pantalla es una tarjeta angosta y centrada.
const ANCHOS = ['angosta', 'media', 'formulario'];
const anchoDe = (className = '') => className.split(' ').find((clase) => ANCHOS.includes(clase)) ?? '';

export function Pantalla({ titulo, children, className, regresar }: Props) {
  useEffect(() => {
    document.title = `${titulo} · T Efficiency`;
  }, [titulo]);

  return (
    <div className="w">
      <Encabezado />
      {regresar && (
        <nav className={`regreso ${anchoDe(className)}`.trim()} aria-label="Regresar">
          <Link className="regresar" to={regresar.a}><span aria-hidden="true">←</span> {regresar.texto}</Link>
        </nav>
      )}
      <main id="contenido" className={className}>{children}</main>
    </div>
  );
}
