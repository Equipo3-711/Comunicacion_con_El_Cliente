// Conexión con la API del portal. Es el único archivo que hace peticiones:
// las pantallas solo llaman a estas funciones (separación entre conexión y vistas, AGENTS.md).
import { API_URL } from './config.js';
import { token, cerrarSesion, irA } from './sesion.js';

export class ErrorApi extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;
    this.detalles = detalles;
  }
}

async function enviar(metodo, ruta, cuerpo) {
  const sesion = token();
  const opciones = { method: metodo, headers: {} };
  if (sesion) opciones.headers.Authorization = `Bearer ${sesion}`;
  if (cuerpo instanceof FormData) {
    opciones.body = cuerpo;
  } else if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que la API esté encendida.');
  }

  // Con sesión, un 401 significa que el token expiró: se vuelve a iniciar sesión.
  if (respuesta.status === 401 && sesion) {
    cerrarSesion();
    irA('index.html?expirada=1');
  }
  return respuesta;
}

async function pedir(metodo, ruta, cuerpo) {
  const respuesta = await enviar(metodo, ruta, cuerpo);
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos.error || 'Ocurrió un error. Intenta de nuevo.', datos.detalles);
  return datos;
}

// Para documentos y fotos: se piden con el token y se muestran sin enlace de descarga.
async function pedirArchivo(ruta) {
  const respuesta = await enviar('GET', ruta);
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new ErrorApi(respuesta.status, datos.error || 'No se pudo abrir el archivo.');
  }
  return respuesta.blob();
}

export const api = {
  // Cuenta
  iniciarSesion: (datos) => pedir('POST', '/auth/login', datos),
  registrar: (datos) => pedir('POST', '/auth/registro', datos),
  yo: () => pedir('GET', '/auth/yo'),

  // Proyectos y seguimiento
  proyectos: () => pedir('GET', '/proyectos'),
  proyecto: (id) => pedir('GET', `/proyectos/${id}`),
  historial: (id) => pedir('GET', `/proyectos/${id}/historial`),
  documentos: (id) => pedir('GET', `/proyectos/${id}/documentos`),
  actividades: (id) => pedir('GET', `/proyectos/${id}/actividades`),
  verDocumento: (id) => pedirArchivo(`/documentos/${id}/ver`),
  verFoto: (id) => pedirArchivo(`/fotos/${id}/ver`),

  // Chat y campana
  mensajes: (id) => pedir('GET', `/proyectos/${id}/mensajes`),
  enviarMensaje: (id, texto) => pedir('POST', `/proyectos/${id}/mensajes`, { texto }),
  pendientes: () => pedir('GET', '/pendientes'),
  marcarLeido: (id) => pedir('PATCH', `/pendientes/${id}/leido`),
  marcarTodosLeidos: () => pedir('PATCH', '/pendientes/leidos'),

  // Cotizaciones
  cotizaciones: () => pedir('GET', '/cotizaciones'),
  cotizacion: (id) => pedir('GET', `/cotizaciones/${id}`),
  enviarCotizacion: (formulario) => pedir('POST', '/cotizaciones', formulario),
  modificarCotizacion: (id, datos) => pedir('PUT', `/cotizaciones/${id}`, datos),
  verArchivoCotizacion: (id) => pedirArchivo(`/cotizaciones/archivos/${id}/ver`),

  // Solo el personal (arquitecto)
  empresas: () => pedir('GET', '/empresas'),
  clientes: () => pedir('GET', '/clientes'),
  agregarCliente: (datos) => pedir('POST', '/clientes', datos),
  cambiarEstadoCotizacion: (id, estado) => pedir('PATCH', `/cotizaciones/${id}/estado`, { estado }),
  solicitudes: (filtros = {}) => {
    const consulta = new URLSearchParams(filtros).toString();
    return pedir('GET', `/solicitudes${consulta ? `?${consulta}` : ''}`);
  },
  registrarSolicitud: (datos) => pedir('POST', '/solicitudes', datos),
  actualizarSolicitud: (id, cambios) => pedir('PATCH', `/solicitudes/${id}`, cambios),
  responsables: () => pedir('GET', '/solicitudes/responsables'),
  crearProyecto: (datos) => pedir('POST', '/proyectos', datos),
  actualizarDatos: (id, datos) => pedir('PATCH', `/proyectos/${id}`, datos),
  cambiarEstado: (id, estado) => pedir('PATCH', `/proyectos/${id}/estado`, { estado }),
  cambiarAtencion: (id, atencion) => pedir('PATCH', `/proyectos/${id}/atencion`, { atencion }),
  registrarActualizacion: (id, formulario) => pedir('POST', `/proyectos/${id}/actualizaciones`, formulario),
  subirDocumento: (id, formulario) => pedir('POST', `/proyectos/${id}/documentos`, formulario),
  crearActividad: (id, descripcion) => pedir('POST', `/proyectos/${id}/actividades`, { descripcion }),
  marcarRealizada: (actividadId) => pedir('PATCH', `/actividades/${actividadId}/realizada`),
};
