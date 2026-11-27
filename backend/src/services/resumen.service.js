// Seguimiento automático del proyecto (CC-05): el portal le explica al cliente cómo va su obra
// con lo que ya registró el personal (etapa, actividades, último movimiento, pagos y garantía).
// Son reglas sobre los datos del proyecto, no inteligencia artificial: no tiene costo, responde
// al momento y ningún dato sale del portal. Se arma cada vez que se pide, así que siempre está al día.
const actividadesRepo = require('../repositories/actividades.repository');
const actualizaciones = require('../repositories/actualizaciones.repository');
const { verificarAcceso } = require('./proyectos.service');
const { ESTADOS } = require('../validators/proyecto.validator');

const ETAPAS = ['cotizacion', 'en_proceso', 'en_instalacion', 'terminado'];
// Sin movimientos por más de estos días (y sin terminar), se le sugiere preguntar.
const DIAS_SIN_MOVIMIENTO = 7;
const ZONA = 'America/Mexico_City';

const dinero = (valor) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);

// El día (AAAA-MM-DD) en la hora de México, para contar días de calendario y no de 24 horas.
// La base entrega las fechas como texto y ya en hora de México (dateStrings y DB_TIMEZONE):
// se toma el día tal cual, porque convertirlas otra vez las recorrería un día.
function diaDe(fecha) {
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fecha)) return fecha.slice(0, 10);
  return new Date(fecha).toLocaleDateString('en-CA', { timeZone: ZONA });
}

function fechaLarga(fecha) {
  const [anio, mes, dia] = diaDe(fecha).split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia, 12)).toLocaleDateString('es-MX', {
    timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function diasEntre(desde, hasta) {
  return Math.round((Date.parse(diaDe(hasta)) - Date.parse(diaDe(desde))) / 86400000);
}

function haceCuanto(dias) {
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

const porcentaje = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);

function etapaDe(estado) {
  return { clave: estado, nombre: ESTADOS[estado] || estado, numero: ETAPAS.indexOf(estado) + 1, total: ETAPAS.length };
}

function resumirActividades(lista) {
  const realizadas = lista.filter((actividad) => actividad.realizada).length;
  const siguiente = lista.find((actividad) => !actividad.realizada);
  return {
    realizadas, total: lista.length, porcentaje: porcentaje(realizadas, lista.length), siguiente: siguiente ? siguiente.descripcion : null,
  };
}

function resumirPagos(proyecto) {
  const presupuesto = Number(proyecto.presupuesto) || 0;
  if (presupuesto <= 0) return null;
  const pagado = Number(proyecto.pagado) || 0;
  return { presupuesto, pagado, porcentaje: Math.min(100, porcentaje(pagado, presupuesto)), saldo: Math.max(0, presupuesto - pagado) };
}

function textoEtapa(etapa) {
  if (etapa.clave === 'terminado') return 'Tu obra está terminada.';
  return `Tu obra está en «${etapa.nombre}», etapa ${etapa.numero} de ${etapa.total}.`;
}

function textoActividades({ realizadas, total, porcentaje: avance, siguiente }) {
  if (total === 0) return 'Todavía no hay actividades programadas.';
  const base = `Van ${realizadas} de ${total} actividades realizadas (${avance} %).`;
  return siguiente ? `${base} Lo siguiente es «${siguiente}».` : `${base} Ya están todas.`;
}

function textoPagos(pagos) {
  if (pagos.saldo === 0) return `Tu proyecto ya está pagado completo (${dinero(pagos.presupuesto)}).`;
  return `Has pagado ${dinero(pagos.pagado)} de ${dinero(pagos.presupuesto)} (${pagos.porcentaje} %).`;
}

function puntosDe({ etapa, actividades, ultimo, pagos, proyecto }) {
  const puntos = [textoEtapa(etapa), textoActividades(actividades)];
  if (ultimo) puntos.push(`El último movimiento fue ${haceCuanto(ultimo.dias)}: «${ultimo.descripcion}», por ${ultimo.responsable}.`);
  if (pagos) puntos.push(textoPagos(pagos));
  if (proyecto.garantiaHasta) puntos.push(`Tu garantía está vigente hasta el ${fechaLarga(proyecto.garantiaHasta)}.`);
  return puntos;
}

function avisosDe({ etapa, actividades, ultimo, pagos }) {
  const avisos = [];
  const terminado = etapa.clave === 'terminado';
  if (!terminado && ultimo && ultimo.dias >= DIAS_SIN_MOVIMIENTO) {
    avisos.push(`Lleva ${ultimo.dias} días sin movimientos registrados. Si tienes una duda, pregúntale a tu arquitecto en el chat.`);
  }
  if (!terminado && actividades.total > 0 && actividades.realizadas === actividades.total) {
    avisos.push('Todas las actividades están realizadas: falta que tu arquitecto marque la obra como terminada.');
  }
  if (terminado && pagos && pagos.saldo > 0) avisos.push(`Queda un saldo de ${dinero(pagos.saldo)}.`);
  return avisos;
}

// Arma el resumen con los datos ya cargados. Es pura para poder probarla con cualquier fecha.
function armarResumen({ proyecto, actividades: lista, eventos, hoy = new Date() }) {
  const etapa = etapaDe(proyecto.estado);
  const actividades = resumirActividades(lista);
  const reciente = eventos[0];
  const ultimo = reciente
    ? { descripcion: reciente.descripcion, responsable: reciente.responsable, fecha: reciente.fecha, dias: diasEntre(reciente.fecha, hoy) }
    : null;
  const pagos = resumirPagos(proyecto);
  const datos = { etapa, actividades, ultimo, pagos, proyecto };
  return {
    etapa,
    actividades,
    ultimoMovimiento: ultimo,
    pagos,
    garantiaHasta: proyecto.garantiaHasta || null,
    puntos: puntosDe(datos),
    avisos: avisosDe(datos),
    generadoEn: new Date(hoy).toISOString(),
  };
}

async function obtener(usuario, proyectoId) {
  const proyecto = await verificarAcceso(usuario, proyectoId);
  const [lista, eventos] = await Promise.all([
    actividadesRepo.listarPorProyecto(proyecto.id),
    actualizaciones.listarPorProyecto(proyecto.id),
  ]);
  return armarResumen({ proyecto, actividades: lista || [], eventos: eventos || [] });
}

module.exports = { obtener, armarResumen, DIAS_SIN_MOVIMIENTO };
