// Conexión con la API del portal. Solo la carpeta src/api hace peticiones:
// las pantallas llaman a sus funciones (separación entre conexión y vistas, AGENTS.md).
import { borrarSesion, tokenActual } from '../sesion/almacen';

// En desarrollo, Vite pasa /api a la API (vite.config.ts). En otro servidor se cambia con VITE_API_URL.
export const API_URL: string = import.meta.env.VITE_API_URL || '/api';

export type Detalles = Record<string, string>;

export class ErrorApi extends Error {
  readonly estado: number;
  detalles: Detalles;

  constructor(estado: number, mensaje: string, detalles: Detalles = {}) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.detalles = detalles;
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Con sesión, un 401 significa que el token expiró: se vuelve a iniciar sesión.
function sesionExpirada(): void {
  borrarSesion();
  window.location.assign(`${import.meta.env.BASE_URL}?expirada=1`);
}

async function enviar(metodo: Metodo, ruta: string, cuerpo?: unknown): Promise<Response> {
  const token = tokenActual();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (cuerpo instanceof FormData) {
    body = cuerpo;
  } else if (cuerpo !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(cuerpo);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, { method: metodo, headers, body });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que la API esté encendida.');
  }
  if (respuesta.status === 401 && token) sesionExpirada();
  return respuesta;
}

async function leerJson(respuesta: Response): Promise<Record<string, unknown>> {
  return respuesta.json().catch(() => ({}));
}

export async function pedir<T>(metodo: Metodo, ruta: string, cuerpo?: unknown): Promise<T> {
  const respuesta = await enviar(metodo, ruta, cuerpo);
  if (respuesta.status === 204) return null as T;
  const datos = await leerJson(respuesta);
  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      (datos.error as string) || 'Ocurrió un error. Intenta de nuevo.',
      (datos.detalles as Detalles) || {},
    );
  }
  return datos as T;
}

// Para documentos y fotos: se piden con el token y se muestran sin enlace de descarga.
export async function pedirArchivo(ruta: string): Promise<Blob> {
  const respuesta = await enviar('GET', ruta);
  if (!respuesta.ok) {
    const datos = await leerJson(respuesta);
    throw new ErrorApi(respuesta.status, (datos.error as string) || 'No se pudo abrir el archivo.');
  }
  return respuesta.blob();
}

// Quita los filtros vacíos y arma la consulta (?a=1&b=2), sin «?» suelto si no hay ninguno.
export function consulta(filtros: Record<string, string | undefined> = {}): string {
  const llenos = Object.entries(filtros).filter((par): par is [string, string] => Boolean(par[1]));
  const texto = new URLSearchParams(llenos).toString();
  return texto ? `?${texto}` : '';
}
