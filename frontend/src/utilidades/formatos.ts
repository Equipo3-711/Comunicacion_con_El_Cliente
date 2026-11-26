// Formatos de fecha, dinero e iniciales.
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// La API entrega las fechas como "2026-11-08 10:30:00" (o solo "2026-11-08").
function partesDe(fecha: string) {
  const [dia, horaTexto = ''] = String(fecha).replace('T', ' ').split(' ');
  const [anio, mes, numero] = dia.split('-').map(Number);
  return { anio, mes, numero, hora: horaTexto.slice(0, 5) };
}

export function fechaCorta(fecha?: string | null): string {
  if (!fecha) return '';
  const { mes, numero } = partesDe(fecha);
  return `${String(numero).padStart(2, '0')} ${MESES[mes - 1]}`;
}

export const hora = (fecha?: string | null): string => (fecha ? partesDe(fecha).hora : '');

export function mesYAnio(fecha: string): string {
  const { anio, mes } = partesDe(fecha);
  return `${MESES_LARGOS[mes - 1]} ${anio}`;
}

export function hoy(ahora = new Date()): string {
  return `${String(ahora.getDate()).padStart(2, '0')} ${MESES[ahora.getMonth()]}`;
}

export function dinero(cantidad: number | string | null | undefined): string {
  if (cantidad === null || cantidad === undefined || cantidad === '') return 'Por definir';
  return `$${Number(cantidad).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;
}

export function iniciales(nombre?: string | null): string {
  return String(nombre || '?')
    .replace(/^(Arq|Ing|Lic)\.\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0] || '')
    .join('')
    .toUpperCase();
}

// «2026-11-08 10:30:00» → «2026-11-08», para un <input type="date">.
export const soloFecha = (fecha?: string | null): string => (fecha ? String(fecha).slice(0, 10) : '');
