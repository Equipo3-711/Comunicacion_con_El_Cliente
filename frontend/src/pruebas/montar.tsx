// Monta una pantalla con sesión, avisos y rutas, como en la aplicación real.
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { ProveedorAvisos } from '../componentes/Avisos';
import { ProveedorSesion } from '../sesion/Sesion';
import { guardarSesion } from '../sesion/almacen';
import type { Usuario } from '../tipos';
import type { ReactElement } from 'react';

export const ADMIN: Usuario = {
  id: 1, nombre: 'Arq. Laura Méndez', correo: 'laura@tefficiency.test', telefono: null, rol: 'admin', empresaId: null, empresa: null,
};
export const CLIENTE: Usuario = {
  id: 10, nombre: 'Ana López', correo: 'ana@roble.test', telefono: '477 123 4567', rol: 'cliente', empresaId: 3, empresa: 'Constructora Roble',
};

// Muestra en qué dirección quedó la aplicación, para revisar redirecciones.
function Direccion() {
  const { pathname, search } = useLocation();
  return <output data-testid="direccion">{pathname + search}</output>;
}

interface Opciones {
  usuario?: Usuario | null;
  ruta?: string;
  patron?: string;
}

export function montar(pantalla: ReactElement, { usuario = null, ruta = '/', patron = '*' }: Opciones = {}) {
  if (usuario) guardarSesion({ token: 'token-de-prueba', usuario });
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <ProveedorSesion>
        <ProveedorAvisos>
          <Routes>
            <Route path={patron} element={pantalla} />
            <Route path="*" element={null} />
          </Routes>
          <Direccion />
        </ProveedorAvisos>
      </ProveedorSesion>
    </MemoryRouter>,
  );
}
