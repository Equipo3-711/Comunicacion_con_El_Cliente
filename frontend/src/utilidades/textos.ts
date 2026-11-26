// Cómo se muestra cada valor que guarda la API.
import type {
  Atencion, Canal, Categoria, EstadoCotizacion, EstadoProyecto, EstadoSolicitud, TipoCliente, TipoEvento, TipoTrabajo,
} from '../tipos';

export const ESTADOS: Record<EstadoProyecto, string> = {
  cotizacion: 'En cotización',
  en_proceso: 'En proceso',
  en_instalacion: 'En instalación',
  terminado: 'Terminado',
};
export const ATENCION: Record<Atencion, string> = { no_atendido: 'No atendido', pendiente: 'Pendiente', atendido: 'Atendido' };
export const TIPOS_EVENTO: Record<TipoEvento, string> = {
  avance: 'Avance', cambio_estado: 'Cambio de estado', documento: 'Documento', solicitud: 'Solicitud',
};
export const TIPOS_TRABAJO: Record<TipoTrabajo, string> = {
  ventanas: 'Ventanas', fachada: 'Fachada', canceles: 'Canceles', barandales: 'Barandales',
};
export const TIPOS_CLIENTE: Record<TipoCliente, string> = {
  particular: 'Particular', constructora: 'Constructora', arquitecto: 'Arquitecto', otro: 'Otro',
};
export const ESTADOS_COTIZACION: Record<EstadoCotizacion, string> = { recibida: 'Recibida', en_revision: 'En revisión', enviada: 'Enviada' };
export const CANALES: Record<Canal, string> = {
  portal: 'Portal web', whatsapp: 'WhatsApp', llamada: 'Llamada', redes_sociales: 'Redes sociales', correo: 'Correo', presencial: 'En persona',
};
export const CATEGORIAS: Record<Categoria, string> = {
  cotizacion: 'Cotización', duda: 'Duda', modificacion: 'Modificación', queja: 'Queja', seguimiento: 'Seguimiento', informacion: 'Información general',
};
export const ESTADOS_SOLICITUD: Record<EstadoSolicitud, string> = { nueva: 'Nueva', en_atencion: 'En atención', atendida: 'Atendida' };

// «Ana López · Constructora Roble», o solo el nombre si la empresa se llama igual (particulares).
export function nombreConEmpresa(nombre: string, empresa?: string | null): string {
  return empresa && empresa !== nombre ? `${nombre} · ${empresa}` : nombre;
}
