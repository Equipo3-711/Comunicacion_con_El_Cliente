// Quién inició sesión, disponible para cualquier pantalla con useSesion().
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import type { Rol, Sesion, Usuario } from '../tipos';
import { actualizarUsuarioGuardado, borrarSesion, guardarSesion, inicioDe, leerSesion } from './almacen';

interface ValorSesion {
  usuario: Usuario | null;
  iniciar: (sesion: Sesion) => void;
  salir: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const ContextoSesion = createContext<ValorSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => leerSesion()?.usuario ?? null);

  const iniciar = useCallback((sesion: Sesion) => {
    guardarSesion(sesion);
    setUsuario(sesion.usuario);
  }, []);

  const salir = useCallback(() => {
    borrarSesion();
    setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback((nuevo: Usuario) => {
    actualizarUsuarioGuardado(nuevo);
    setUsuario(nuevo);
  }, []);

  const valor = useMemo(() => ({ usuario, iniciar, salir, actualizarUsuario }), [usuario, iniciar, salir, actualizarUsuario]);
  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error('useSesion se usa dentro de <ProveedorSesion>.');
  return valor;
}

// Para las pantallas que ya exigen sesión: el usuario siempre existe.
export function useUsuario(): Usuario {
  const { usuario } = useSesion();
  if (!usuario) throw new Error('Esta pantalla necesita sesión iniciada.');
  return usuario;
}

// Exige sesión iniciada y uno de los roles. Si no, manda a la pantalla que corresponde.
export function RutaProtegida({ roles }: { roles: Rol[] }) {
  const { usuario } = useSesion();
  if (!usuario) return <Navigate to="/" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to={inicioDe(usuario.rol)} replace />;
  return <Outlet />;
}
