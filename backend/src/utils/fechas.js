// Fechas escritas en español para los correos y el historial (RF-19).
function nombreDelMes(numero) {
  switch (numero) {
    case 1: return 'enero';
    case 2: return 'febrero';
    case 3: return 'marzo';
    case 4: return 'abril';
    case 5: return 'mayo';
    case 6: return 'junio';
    case 7: return 'julio';
    case 8: return 'agosto';
    case 9: return 'septiembre';
    case 10: return 'octubre';
    case 11: return 'noviembre';
    case 12: return 'diciembre';
    default: return null;
  }
}

// Convierte "2026-11-23" en "23 de noviembre de 2026". Si la fecha no es válida, devuelve null.
function formatearFecha(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor ?? ''));
  if (!partes) return null;

  const [, anio, mes, dia] = partes;
  const mesEscrito = nombreDelMes(Number(mes));
  if (!mesEscrito) return null;

  return `${Number(dia)} de ${mesEscrito} de ${anio}`;
}

module.exports = { formatearFecha };
