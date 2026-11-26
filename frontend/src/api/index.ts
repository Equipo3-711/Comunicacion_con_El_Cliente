// Todas las rutas de la API que usa el portal, agrupadas por tema.
import { consulta, pedir, pedirArchivo } from './cliente';
import type {
  Actividad, CambiosSolicitud, ClienteRegistrado, Cotizacion, CotizacionDetalle, DatosCotizacion, Documento,
  DatosPregunta, Empresa, EventoHistorial, FiltrosSolicitudes, Mensaje, NuevaSolicitud, Pendiente, Persona,
  PreguntaFrecuente, Proyecto, Sesion, Solicitud, Usuario,
} from '../tipos';

export { ErrorApi, API_URL } from './cliente';

export const cuenta = {
  iniciarSesion: (datos: { correo: string; contrasena: string }) => pedir<Sesion>('POST', '/auth/login', datos),
  registrar: (datos: Record<string, string>) => pedir<Sesion>('POST', '/auth/registro', datos),
  yo: () => pedir<{ usuario: Usuario }>('GET', '/auth/yo'),
};

export const proyectos = {
  listar: () => pedir<{ proyectos: Proyecto[] }>('GET', '/proyectos'),
  obtener: (id: string | number) => pedir<{ proyecto: Proyecto }>('GET', `/proyectos/${id}`),
  historial: (id: string | number) => pedir<{ historial: EventoHistorial[] }>('GET', `/proyectos/${id}/historial`),
  documentos: (id: string | number) => pedir<{ documentos: Documento[] }>('GET', `/proyectos/${id}/documentos`),
  verDocumento: (id: string | number) => pedirArchivo(`/documentos/${id}/ver`),
  verFoto: (id: string | number) => pedirArchivo(`/fotos/${id}/ver`),
  // Solo el personal
  crear: (datos: { empresaId: string; nombre: string; tipoTrabajo: string; cotizacionId?: number }) =>
    pedir<{ proyecto: Proyecto }>('POST', '/proyectos', datos),
  actualizarDatos: (id: string | number, datos: Record<string, string>) =>
    pedir<{ proyecto: Proyecto }>('PATCH', `/proyectos/${id}`, datos),
  cambiarEstado: (id: string | number, estado: string) => pedir('PATCH', `/proyectos/${id}/estado`, { estado }),
  cambiarAtencion: (id: string | number, atencion: string) => pedir('PATCH', `/proyectos/${id}/atencion`, { atencion }),
  registrarActualizacion: (id: string | number, formulario: FormData) =>
    pedir('POST', `/proyectos/${id}/actualizaciones`, formulario),
  subirDocumento: (id: string | number, formulario: FormData) => pedir('POST', `/proyectos/${id}/documentos`, formulario),
};

export const actividades = {
  listar: (proyectoId: string | number) => pedir<{ actividades: Actividad[] }>('GET', `/proyectos/${proyectoId}/actividades`),
  crear: (proyectoId: string | number, descripcion: string) =>
    pedir('POST', `/proyectos/${proyectoId}/actividades`, { descripcion }),
  marcarRealizada: (id: number) => pedir('PATCH', `/actividades/${id}/realizada`),
};

export const chat = {
  mensajes: (proyectoId: string | number) => pedir<{ mensajes: Mensaje[] }>('GET', `/proyectos/${proyectoId}/mensajes`),
  enviar: (proyectoId: string | number, texto: string) => pedir('POST', `/proyectos/${proyectoId}/mensajes`, { texto }),
};

export const pendientes = {
  listar: () => pedir<{ total: number; pendientes: Pendiente[] }>('GET', '/pendientes'),
  marcarLeido: (id: number) => pedir('PATCH', `/pendientes/${id}/leido`),
  marcarTodos: () => pedir('PATCH', '/pendientes/leidos'),
};

export const cotizaciones = {
  listar: () => pedir<{ cotizaciones: Cotizacion[] }>('GET', '/cotizaciones'),
  obtener: (id: string | number) => pedir<{ cotizacion: CotizacionDetalle }>('GET', `/cotizaciones/${id}`),
  enviar: (formulario: FormData) => pedir('POST', '/cotizaciones', formulario),
  modificar: (id: string | number, datos: DatosCotizacion) => pedir('PUT', `/cotizaciones/${id}`, datos),
  verArchivo: (id: string | number) => pedirArchivo(`/cotizaciones/archivos/${id}/ver`),
  cambiarEstado: (id: string | number, estado: string) => pedir('PATCH', `/cotizaciones/${id}/estado`, { estado }),
};

// Preguntas frecuentes con respuesta automática (RF-13). El cliente las lee; el personal las configura.
export const preguntas = {
  listar: () => pedir<{ preguntas: PreguntaFrecuente[] }>('GET', '/preguntas'),
  sugerencias: (texto: string) =>
    pedir<{ sugerencias: PreguntaFrecuente[] }>('GET', `/preguntas/sugerencias${consulta({ texto })}`),
  marcarResuelta: (id: number) => pedir('POST', `/preguntas/${id}/resuelta`),
  crear: (datos: DatosPregunta) => pedir<{ pregunta: PreguntaFrecuente }>('POST', '/preguntas', datos),
  actualizar: (id: number, datos: DatosPregunta) => pedir<{ pregunta: PreguntaFrecuente }>('PUT', `/preguntas/${id}`, datos),
  eliminar: (id: number) => pedir('DELETE', `/preguntas/${id}`),
};

// Solo el personal (arquitecto)
export const clientes = {
  listar: () => pedir<{ clientes: ClienteRegistrado[] }>('GET', '/clientes'),
  agregar: (datos: Record<string, string>) => pedir('POST', '/clientes', datos),
  empresas: () => pedir<{ empresas: Empresa[] }>('GET', '/empresas'),
};

export const solicitudes = {
  listar: (filtros: FiltrosSolicitudes = {}) =>
    pedir<{ solicitudes: Solicitud[] }>('GET', `/solicitudes${consulta({ ...filtros })}`),
  registrar: (datos: NuevaSolicitud) => pedir<{ solicitud: Solicitud }>('POST', '/solicitudes', datos),
  actualizar: (id: number, cambios: CambiosSolicitud) => pedir<{ solicitud: Solicitud }>('PATCH', `/solicitudes/${id}`, cambios),
  responsables: () => pedir<{ responsables: Persona[] }>('GET', '/solicitudes/responsables'),
};
