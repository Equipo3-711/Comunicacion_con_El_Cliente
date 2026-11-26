// Llena la base con datos de ejemplo para probar la aplicación web: dos personas del personal,
// tres clientes con sus proyectos, actividades, un documento, mensajes, una cotización, solicitudes
// y las preguntas frecuentes del chat.
// Usa los mismos servicios que la API, así que el historial y la campana quedan como en uso real.
// Pide una sola contraseña para todas las cuentas, para que ninguna quede escrita en el repositorio.
//   node scripts/datos-prueba.js
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');
const bcrypt = require('bcryptjs');
const config = require('../src/config/env');
const db = require('../src/config/db');
const usuarios = require('../src/repositories/usuarios.repository');
const authService = require('../src/services/auth.service');
const proyectosService = require('../src/services/proyectos.service');
const seguimiento = require('../src/services/seguimiento.service');
const documentosService = require('../src/services/documentos.service');
const mensajesService = require('../src/services/mensajes.service');
const cotizacionesService = require('../src/services/cotizaciones.service');
const solicitudesService = require('../src/services/solicitudes.service');
const preguntasService = require('../src/services/preguntas.service');

const CORREO_ARQUITECTO = 'arquitecto@tefficiency.test';

// Segunda persona del personal, para probar la asignación de solicitudes (RF-05).
const PERSONAL = [
  { nombre: 'Arq. Miguel Sánchez', correo: CORREO_ARQUITECTO, telefono: '4771112233' },
  { nombre: 'Ing. Paola Ruiz', correo: 'paola@tefficiency.test', telefono: '4771114455' },
];

const CLIENTES = [
  { nombre: 'Ana López', empresa: 'Constructora Roble', correo: 'ana@roble.test', telefono: '4771234567' },
  { nombre: 'Carlos Gómez', empresa: 'Despacho Gómez Arquitectos', correo: 'carlos@gomez.test', telefono: '4779876543' },
  { nombre: 'Laura Ramírez', empresa: 'Laura Ramírez', correo: 'laura@ramirez.test', telefono: '4775550101' },
];

async function pedirContrasena() {
  const terminal = readline.createInterface({ input: process.stdin });
  process.stdout.write('Contraseña para todas las cuentas de prueba (mínimo 8 caracteres): ');
  const { value } = await terminal[Symbol.asyncIterator]().next();
  terminal.close();
  process.stdout.write('\n');
  return value ?? '';
}

async function crearPersonal({ nombre, correo, telefono }, contrasena) {
  const contrasenaHash = await bcrypt.hash(contrasena, 10);
  const id = await usuarios.crear({ nombre, correo, telefono, contrasenaHash, rol: 'admin' });
  return { id, nombre, rol: 'admin', empresaId: null };
}

async function crearCliente(datos, contrasena) {
  const { usuario } = await authService.registrar({ ...datos, contrasena });
  return { id: usuario.id, nombre: usuario.nombre, rol: 'cliente', empresaId: usuario.empresaId };
}

// Un PDF muy pequeño, escrito a mano, para probar el visor de documentos.
function crearPdfContrato() {
  const contenido = 'BT /F1 18 Tf 72 720 Td (Contrato de servicios) Tj 0 -28 Td /F1 12 Tf (Ventanas - Calle Roble 12) Tj ET';
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const posiciones = objetos.map((objeto, i) => {
    const posicion = pdf.length;
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
    return posicion;
  });
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += posiciones.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;

  const filename = `${crypto.randomUUID()}.pdf`;
  const carpeta = path.join(config.archivos.carpeta, 'documentos');
  fs.mkdirSync(carpeta, { recursive: true });
  fs.writeFileSync(path.join(carpeta, filename), pdf);
  return { filename, originalname: 'contrato.pdf', mimetype: 'application/pdf' };
}

async function proyectoVentanas(arquitecto, ana) {
  const proyecto = await proyectosService.crear(arquitecto, {
    empresaId: ana.empresaId, nombre: 'Ventanas · Calle Roble 12', tipoTrabajo: 'ventanas',
    presupuesto: 250000, garantiaHasta: '2028-01-31', notasInternas: 'Cliente frecuente: dar prioridad.',
  });
  await proyectosService.actualizarDatos(arquitecto, proyecto.id, { pagado: 100000 });
  await proyectosService.cambiarEstado(arquitecto, proyecto.id, 'en_proceso');

  const medicion = await seguimiento.crearActividad(arquitecto, proyecto.id, { descripcion: 'Medición en obra' });
  await seguimiento.crearActividad(arquitecto, proyecto.id, { descripcion: 'Fabricación de vidrios' });
  await seguimiento.crearActividad(arquitecto, proyecto.id, { descripcion: 'Instalación' });
  await seguimiento.marcarRealizada(arquitecto, medicion.id);
  await seguimiento.registrarActualizacion(arquitecto, proyecto.id, { tipo: 'avance', descripcion: 'Fabricación de vidrios al 60 %.' });
  await documentosService.subir(arquitecto, proyecto.id, crearPdfContrato(), 'Contrato');

  await mensajesService.enviar(ana, proyecto.id, '¿Ya tienen fecha de instalación?');
  await mensajesService.enviar(arquitecto, proyecto.id, 'Sí, el 14 de noviembre a las 10:00.');
  return proyecto;
}

async function proyectoBarandal(arquitecto, ana) {
  const proyecto = await proyectosService.crear(arquitecto, {
    empresaId: ana.empresaId, nombre: 'Barandal · Av. Torres 40', tipoTrabajo: 'barandales', presupuesto: 85000,
  });
  await seguimiento.crearActividad(arquitecto, proyecto.id, { descripcion: 'Visita de medición' });
  await mensajesService.enviar(ana, proyecto.id, '¿Me pueden enviar la cotización actualizada?');
}

async function proyectosDeOtrosClientes(arquitecto, carlos, laura) {
  const fachada = await proyectosService.crear(arquitecto, {
    empresaId: carlos.empresaId, nombre: 'Fachada · Blvd. López Mateos 300', tipoTrabajo: 'fachada', presupuesto: 640000,
  });
  await proyectosService.cambiarEstado(arquitecto, fachada.id, 'en_instalacion');

  await proyectosService.crear(arquitecto, {
    empresaId: laura.empresaId, nombre: 'Canceles · Privada Sauces 8', tipoTrabajo: 'canceles', presupuesto: 32000,
  });
  await cotizacionesService.crear(laura, {
    telefono: '4775550101', tipoCliente: 'particular', tipoTrabajo: 'ventanas',
    direccion: 'Privada Sauces 8, Col. Jardines, León', medidas: '2 ventanas de 1.00 × 1.20 m',
    descripcion: 'Cambiar las ventanas de la recámara por aluminio negro.',
  });
  return fachada;
}

// Solicitudes que llegaron por fuera del portal, como las registraría el personal (RF-01, RF-04, RF-05).
async function solicitudes(arquitecto, paola, { ana, carlos, ventanas, fachada }) {
  const sinCuenta = { clienteId: null, proyectoId: null };
  await solicitudesService.registrar(arquitecto, {
    ...sinCuenta, canal: 'whatsapp', categoria: 'informacion', responsableId: paola.id,
    contactoNombre: 'Roberto Díaz', contactoTelefono: '4773001122',
    descripcion: 'Pregunta si hacen canceles de baño de vidrio templado y cuánto tardan.',
  });
  await solicitudesService.registrar(arquitecto, {
    ...sinCuenta, canal: 'redes_sociales', categoria: 'cotizacion', responsableId: null,
    contactoNombre: 'Mariana Torres', contactoTelefono: null,
    descripcion: 'Mensaje en Facebook: quiere cotizar un barandal de vidrio para la escalera de su casa.',
  });
  const queja = await solicitudesService.registrar(arquitecto, {
    canal: 'correo', categoria: 'queja', clienteId: carlos.id, proyectoId: fachada.id, responsableId: null,
    contactoNombre: null, contactoTelefono: null, descripcion: 'Un panel de la fachada llegó rayado.',
  });
  await solicitudesService.actualizar(arquitecto, queja.id, { estado: 'en_atencion' });
  const llamada = await solicitudesService.registrar(arquitecto, {
    canal: 'llamada', categoria: 'seguimiento', clienteId: ana.id, proyectoId: ventanas.id, responsableId: null,
    contactoNombre: null, contactoTelefono: null, descripcion: 'Llamó para confirmar la instalación del 14 de noviembre.',
  });
  await solicitudesService.actualizar(arquitecto, llamada.id, { estado: 'atendida' });
}

// Preguntas frecuentes que el chat responde solo (RF-13). La última está apagada, para ver la diferencia.
const PREGUNTAS = [
  {
    pregunta: '¿Cuánto tarda la instalación?',
    respuesta: 'Depende del tamaño de la obra. Unas ventanas o un cancel se instalan en 1 o 2 días; una fachada, de 1 a 3 semanas. Tu arquitecto te confirma la fecha en el historial del proyecto.',
    palabrasClave: 'cuánto tarda, tardan, instalación, instalan, cuándo terminan, fecha, días',
  },
  {
    pregunta: '¿Qué garantía tienen los trabajos?',
    respuesta: 'Todos los trabajos tienen garantía por escrito: 2 años en herrajes y sellos, y 5 años en perfiles de aluminio. La fecha exacta aparece en «Garantía» dentro de tu proyecto.',
    palabrasClave: 'garantía, garantia, se rompe, falla, defecto',
  },
  {
    pregunta: '¿El vidrio es templado?',
    respuesta: 'Sí. En canceles, barandales y fachadas usamos vidrio templado de 6 a 10 mm, según la medida. En ventanas puede ser claro, filtrasol o templado; viene indicado en tu cotización.',
    palabrasClave: 'templado, vidrio, cristal, grosor, espesor, mm',
  },
  {
    pregunta: '¿Cómo puedo pagar?',
    respuesta: 'Puedes pagar por transferencia o con tarjeta. Se pide un anticipo del 50 % para fabricar y el resto al terminar la instalación. Tus pagos aparecen en «Pagos realizados».',
    palabrasClave: 'pago, pagar, anticipo, transferencia, tarjeta, factura',
  },
  {
    pregunta: '¿Trabajan en fin de semana?',
    respuesta: 'Instalamos de lunes a sábado. Los domingos solo en casos acordados con tu arquitecto.',
    palabrasClave: 'sábado, domingo, fin de semana, horario',
    activa: false,
  },
];

async function preguntasFrecuentes(arquitecto) {
  for (const pregunta of PREGUNTAS) await preguntasService.crear(arquitecto, { activa: true, ...pregunta });
}

async function main() {
  const faltantes = config.variablesFaltantes();
  if (faltantes.length > 0) {
    console.error(`Faltan variables en backend/.env: ${faltantes.join(', ')}.`);
    process.exit(1);
  }
  const contrasena = await pedirContrasena();
  if (contrasena.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  try {
    if (await usuarios.buscarPorCorreo(CORREO_ARQUITECTO)) {
      console.error('Los datos de prueba ya están cargados. Para empezar de cero: docker compose down -v y docker compose up -d.');
      process.exitCode = 1;
      return;
    }
    const [arquitecto, paola] = [await crearPersonal(PERSONAL[0], contrasena), await crearPersonal(PERSONAL[1], contrasena)];
    const clientes = [];
    for (const cliente of CLIENTES) clientes.push(await crearCliente(cliente, contrasena));
    const [ana, carlos, laura] = clientes;
    const ventanas = await proyectoVentanas(arquitecto, ana);
    await proyectoBarandal(arquitecto, ana);
    const fachada = await proyectosDeOtrosClientes(arquitecto, carlos, laura);
    await solicitudes(arquitecto, paola, { ana, carlos, ventanas, fachada });
    await preguntasFrecuentes(arquitecto);

    console.log('Datos de prueba listos. Cuentas (todas con la contraseña que escribiste):');
    PERSONAL.forEach((persona) => console.log(`  Personal:   ${persona.correo} (${persona.nombre})`));
    CLIENTES.forEach((cliente) => console.log(`  Cliente:    ${cliente.correo} (${cliente.empresa})`));
  } finally {
    await db.cerrar();
  }
}

main().catch((error) => {
  console.error(`No se pudieron cargar los datos de prueba: ${error.message}`);
  process.exit(1);
});
