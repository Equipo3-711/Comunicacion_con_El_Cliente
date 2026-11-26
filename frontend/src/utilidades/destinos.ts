// A qué pantalla lleva cada pendiente de la campana (RF-18).
import type { Pendiente, Usuario } from '../tipos';
import { inicioDe } from '../sesion/almacen';

export function destinoDe(pendiente: Pendiente, usuario: Pick<Usuario, 'rol'>): string {
  const esPersonal = usuario.rol === 'admin';
  if (pendiente.tipo === 'solicitud') return '/arquitecto/solicitudes';
  if (pendiente.tipo === 'cotizacion') return esPersonal ? '/arquitecto#cotizaciones' : '/cliente#cotizaciones';
  if (!pendiente.proyectoId) return inicioDe(usuario.rol);
  const carpeta = esPersonal ? '/arquitecto' : '/cliente';
  if (pendiente.tipo === 'mensaje') return `${carpeta}/proyectos/${pendiente.proyectoId}/chat`;
  return `${carpeta}/proyectos/${pendiente.proyectoId}`;
}
