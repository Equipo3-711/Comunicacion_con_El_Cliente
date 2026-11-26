// Sesión del usuario en este navegador: el token que entrega la API al iniciar sesión.
// Se guarda en sessionStorage, así que se borra al cerrar la pestaña.
import type { Rol, Sesion, Usuario } from '../tipos';

const CLAVE = 'portal-sesion';

export function leerSesion(): Sesion | null {
  try {
    const guardada = sessionStorage.getItem(CLAVE);
    return guardada ? (JSON.parse(guardada) as Sesion) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Sin almacenamiento (modo privado estricto): la sesión dura solo esta página.
  }
}

export function borrarSesion(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}

export const tokenActual = (): string | null => leerSesion()?.token ?? null;

export function actualizarUsuarioGuardado(usuario: Usuario): void {
  const sesion = leerSesion();
  if (sesion) guardarSesion({ ...sesion, usuario });
}

export function inicioDe(rol: Rol): string {
  return rol === 'admin' ? '/arquitecto' : '/cliente';
}
