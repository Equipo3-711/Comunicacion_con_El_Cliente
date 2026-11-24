// Fechas escritas en español para los correos y el historial (RF-19).
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Convierte "2026-11-23" en "23 de noviembre de 2026". Si la fecha no es válida, devuelve null.
function formatearFecha(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor ?? ''));
  if (!partes) return null;

  const [, anio, mes, dia] = partes;
  const nombreDelMes = MESES[Number(mes) - 1];
  if (!nombreDelMes) return null;

  return `${Number(dia)} de ${nombreDelMes} de ${anio}`;
}

module.exports = { formatearFecha };
