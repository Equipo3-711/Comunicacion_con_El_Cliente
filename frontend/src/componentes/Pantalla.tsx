// Marco de cada pantalla: encabezado, contenido y el título de la pestaña.
import { useEffect, type ReactNode } from 'react';
import { Encabezado } from './Encabezado';

interface Props {
  titulo: string;
  children: ReactNode;
  className?: string;
}

export function Pantalla({ titulo, children, className }: Props) {
  useEffect(() => {
    document.title = `${titulo} · T Efficiency`;
  }, [titulo]);

  return (
    <div className="w">
      <Encabezado />
      <main id="contenido" className={className}>{children}</main>
    </div>
  );
}
