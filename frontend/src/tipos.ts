// Forma de los datos que entrega la API (backend/). Si la API cambia un campo,
// TypeScript marca cada pantalla que lo usa.

export type Rol = 'admin' | 'cliente';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  rol: Rol;
  empresaId: number | null;
  empresa: string | null;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export type EstadoProyecto = 'cotizacion' | 'en_proceso' | 'en_instalacion' | 'terminado';
export type Atencion = 'no_atendido' | 'pendiente' | 'atendido';
export type TipoTrabajo = 'ventanas' | 'fachada' | 'canceles' | 'barandales';
export type TipoCliente = 'particular' | 'constructora' | 'arquitecto' | 'otro';
export type TipoEvento = 'avance' | 'cambio_estado' | 'documento' | 'solicitud';

export interface Proyecto {
  id: number;
  nombre: string;
  estado: EstadoProyecto;
  atencion: Atencion;
  tipoTrabajo: TipoTrabajo;
  empresaId: number;
  empresa: string;
  cliente?: string | null;
  responsable?: string | null;
  responsableId?: number | null;
  presupuesto: number | string | null;
  pagado: number | string | null;
  garantiaHasta: string | null;
  notasInternas?: string | null;
  ultimaActualizacion?: string | null;
  creadoEn?: string;
}

export interface EventoHistorial {
  id: number;
  tipo: TipoEvento;
  descripcion: string;
  fecha: string;
  responsable: string;
  fotos: number[];
}

// Seguimiento automático (CC-05): cómo va la obra, armado por la API con los datos del proyecto.
export interface ResumenProyecto {
  etapa: { clave: EstadoProyecto; nombre: string; numero: number; total: number };
  actividades: { realizadas: number; total: number; porcentaje: number; siguiente: string | null };
  ultimoMovimiento: { descripcion: string; responsable: string; fecha: string; dias: number } | null;
  pagos: { presupuesto: number; pagado: number; porcentaje: number; saldo: number } | null;
  garantiaHasta: string | null;
  puntos: string[];
  avisos: string[];
  generadoEn: string;
}

export interface Documento {
  id: number;
  nombre: string;
  creadoEn: string;
}

export interface Actividad {
  id: number;
  descripcion: string;
  realizada: boolean | 0 | 1;
  realizadaEn: string | null;
}

export interface Mensaje {
  id: number;
  autorId: number;
  autor: string;
  texto: string;
  creadoEn: string;
}

export type TipoPendiente = 'actualizacion' | 'mensaje' | 'cotizacion' | 'solicitud';

export interface Pendiente {
  id: number;
  tipo: TipoPendiente;
  descripcion: string;
  proyectoId: number | null;
  creadoEn: string;
}

export type EstadoCotizacion = 'recibida' | 'en_revision' | 'enviada';

interface CotizacionBase {
  id: number;
  clienteId: number;
  cliente: string;
  empresaId: number;
  empresa: string;
  correo?: string;
  telefono: string;
  tipoCliente: TipoCliente;
  tipoTrabajo: TipoTrabajo;
  direccion: string;
  medidas: string | null;
  descripcion: string;
  estado: EstadoCotizacion;
  proyectoId: number | null;
  creadoEn: string;
  modificadaEn: string | null;
}

// En la lista, «archivos» es cuántos adjuntó; en el detalle, la lista de archivos.
export interface Cotizacion extends CotizacionBase {
  archivos: number;
}

export interface ArchivoCotizacion {
  id: number;
  nombre: string;
  tipoMime: string;
}

export interface CotizacionDetalle extends CotizacionBase {
  archivos: ArchivoCotizacion[];
}

export interface DatosCotizacion {
  telefono: string;
  tipoCliente: string;
  tipoTrabajo: string;
  direccion: string;
  medidas: string;
  descripcion: string;
}

export type Canal = 'portal' | 'whatsapp' | 'llamada' | 'redes_sociales' | 'correo' | 'presencial';
export type Categoria = 'cotizacion' | 'duda' | 'modificacion' | 'queja' | 'seguimiento' | 'informacion';
export type EstadoSolicitud = 'nueva' | 'en_atencion' | 'atendida';

export interface Solicitud {
  id: number;
  canal: Canal;
  categoria: Categoria;
  estado: EstadoSolicitud;
  descripcion: string;
  clienteId: number | null;
  contacto: string;
  telefono: string | null;
  empresa: string | null;
  proyectoId: number | null;
  proyecto: string | null;
  cotizacionId: number | null;
  responsableId: number | null;
  responsable: string | null;
  registradaPorId: number;
  registradaPor: string;
  creadoEn: string;
  atendidaEn: string | null;
}

export interface FiltrosSolicitudes {
  estado?: string;
  categoria?: string;
  canal?: string;
  responsable?: string;
}

export interface NuevaSolicitud {
  canal: string;
  categoria: string;
  descripcion: string;
  clienteId: string;
  proyectoId: string;
  contactoNombre: string;
  contactoTelefono: string;
  responsableId: string;
}

export type CambiosSolicitud = Partial<Record<'categoria' | 'estado' | 'responsableId', string>>;

export interface Empresa {
  id: number;
  nombre: string;
}

export interface ClienteRegistrado {
  id: number;
  nombre: string;
  correo?: string;
  empresaId: number;
  empresa: string | null;
}

// Pregunta frecuente con respuesta automática (RF-13). El cliente solo recibe id, pregunta y respuesta.
export interface PreguntaFrecuente {
  id: number;
  pregunta: string;
  respuesta: string;
  palabrasClave?: string;
  activa?: boolean;
  resueltas?: number;
}

export interface DatosPregunta {
  pregunta: string;
  respuesta: string;
  palabrasClave: string;
  activa: boolean;
}

export interface Persona {
  id: number;
  nombre: string;
}
