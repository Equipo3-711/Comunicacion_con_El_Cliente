# Ejemplos de uso

Recorridos paso a paso del Portal de Proyectos, con la aplicación web (`frontend/`) conectada a la API (`backend/`). Para instalar y comenzar a usar el proyecto, consulta el [README](../README.md).

Antes de empezar, levanta la API, carga los datos de prueba con `node scripts/datos-prueba.js` y levanta la aplicación web con `npm run dev` dentro de `frontend/` (se abre en `http://localhost:5173`). Todas las cuentas de prueba usan la contraseña que escribiste al cargar los datos.

## Ejemplo 1: datos incorrectos

1. Escribe un correo o una contraseña que no existan y da clic en **Iniciar sesión**.
2. Aparece «Correo o contraseña incorrectos.», sin decir cuál de los dos datos falló (HU-19, T-08).

## Ejemplo 2: el cliente consulta su proyecto

1. Entra con `ana@roble.test`. Se abre **Mis proyectos** con sus dos obras; cada una dice si su duda está «Atendido» o «Pendiente».
2. Da clic en **Ver proyecto** en «Ventanas · Calle Roble 12».
3. Se ven el presupuesto, los pagos realizados, la garantía y el historial con fecha y responsable de cada movimiento (RF-06, RF-08).
4. Arriba del historial, **Seguimiento automático** explica cómo va la obra sin que Ana pregunte: la etapa en la que está, cuántas actividades van realizadas y cuál sigue, el último movimiento, cuánto ha pagado y, si lleva 7 días o más sin movimientos, se lo dice. Se arma con lo que registra el arquitecto, así que cambia en cuanto él marca una actividad o publica un avance (CC-05). En el chat, el asistente virtual responde lo mismo con **¿Cómo va mi obra?**.
5. En **Documentos**, da clic en **Ver** junto a «Contrato». El documento se muestra dentro del portal, sin botones de descargar ni imprimir (CC-02).

## Ejemplo 3: solicitar una cotización

1. Con la sesión de un cliente, da clic en **Cotizar nuevo proyecto**. El cliente y el correo ya vienen llenos y no se pueden cambiar.
2. Da clic en **Enviar cotización** sin llenar nada: cada campo obligatorio muestra su mensaje en rojo (CC-10).
3. Llena el tipo de cliente, el tipo de trabajo, la dirección y la descripción; si quieres, agrega fotos o planos.
4. Al enviarla, regresas a **Mis proyectos** y la cotización aparece en **Mis cotizaciones** como «Recibida». Al arquitecto le llega en su campana.

## Ejemplo 4: una duda en el chat y el semáforo

1. Como cliente, en el detalle del proyecto da clic en **¿Tienes una duda? Abrir chat** y escribe una pregunta.
2. Entra como `arquitecto@tefficiency.test`. En **Mis clientes**, el proyecto tiene el punto naranja de «No atendido» y la campana muestra la duda.
3. Abre el chat y responde: el estado pasa solo a «Pendiente».
4. Cuando la duda quede resuelta, da clic en **Atendido**. El cliente ve su proyecto como «Atendido».

## Ejemplo 5: el arquitecto publica un avance

1. Como arquitecto, abre un proyecto desde **Mis clientes**.
2. Da clic en **Registrar actualización**, escribe la descripción y, si quieres, agrega fotos. Al guardar, el avance aparece en el historial del cliente con sus fotos y en su campana; si el correo está configurado, también le llega un aviso (RF-07, RF-16, RF-19).
3. En **Actividades**, da clic en **Marcar como realizada**. La actividad se publica sola en el historial del cliente, sin escribirle un mensaje (RF-17).

## Ejemplo 6: agregar un cliente a la cartera

1. Como arquitecto, da clic en **Agregar usuario**.
2. Con **Cliente nuevo**, escribe sus datos, una contraseña inicial que le compartirás y el nombre de la obra. El cliente y su proyecto aparecen en **Mis clientes** (RF-02).
3. Si el cliente ya creó su cuenta (por ejemplo, porque mandó una cotización), usa **Cliente ya registrado** y elige su empresa. Desde **Cotizaciones recibidas**, **Abrir proyecto** llena la empresa y el tipo de trabajo, y deja el proyecto ligado a la cotización.

## Ejemplo: registrar una solicitud que llegó por WhatsApp

1. Como arquitecto, entra a **Solicitudes** desde tu inicio. Ves todo lo que piden los clientes, con las nuevas primero, y puedes filtrar por estado, categoría, canal o responsable (RF-01).
2. Da clic en **Registrar solicitud** y envía el formulario vacío: se marcan el canal, la categoría, el cliente y la descripción.
3. Elige **WhatsApp**, la categoría **Duda**, **Cliente registrado** con Ana López y su proyecto de ventanas. Escribe qué pidió y elige a **Ing. Paola Ruiz** como responsable. Son 5 pasos (RNF-01).
4. Al guardar, la solicitud aparece en la bandeja. Si entras como `paola@tefficiency.test`, su campana dice «Te asignaron una solicitud de Ana López» y lleva a la bandeja (RF-05, RF-12).
5. Si quien escribió no tiene cuenta, usa **Alguien sin cuenta** y anota su nombre y su teléfono.
6. En cada fila puedes cambiar la categoría (RF-04), el responsable y el estado. Al marcarla **Atendida**, se guarda la fecha para medir el tiempo de respuesta.

## Ejemplo: el cliente cambia su cotización

1. Entra como `laura@ramirez.test`. En **Mis cotizaciones**, da clic en **Modificar**, cambia las medidas y guarda (RF-11). En **Tus fotos y planos** ve los que adjuntó, en el visor y sin poder descargarlos (CC-02).
2. Como arquitecto, en **Solicitudes** aparece una **Modificación** de Laura. Con **Ver cotización** abres el detalle: los datos, los planos en el visor y el estado.
3. Si la cotización ya estaba **Enviada**, al modificarla vuelve a **En revisión**. Cuando la marcas como **Enviada**, sus solicitudes quedan atendidas y Laura recibe el aviso en su campana.
4. Con **Abrir proyecto**, el proyecto queda ligado a la cotización y Laura ya no puede modificarla: los cambios se piden en el chat del proyecto.

## Ejemplo: preguntas frecuentes en el chat

1. Entra como `ana@roble.test` y abre el chat de su proyecto de ventanas. Como ya tiene conversación, primero se ven los mensajes; toca **Preguntar al asistente virtual** arriba del campo para escribir. En un chat sin mensajes, el asistente saluda solo (RF-13).
2. Toca **¿Qué garantía tienen los trabajos?**: la respuesta aparece sola, marcada como «Asistente virtual». Contesta **Sí, esto responde mi duda**: no se manda ningún mensaje al arquitecto y el semáforo no cambia. Con **← Ver otras preguntas** regresas al menú; si hay más de 4 preguntas, las flechas **‹ ›** pasan de página. **Hablar con el arquitecto** cierra el menú y deja listo el campo para escribir.
3. Escribe «¿Cuándo terminan la instalación?» y da clic en **Enviar**. Como tiene palabras clave de una pregunta frecuente, el chat primero te sugiere su respuesta. Con **No, enviar mi mensaje al arquitecto**, tu duda se manda como siempre y el proyecto queda en «No atendido».
4. Escribe «Hola, buenas tardes»: no se parece a ninguna pregunta y se manda directo.
5. Como arquitecto, entra a **Preguntas frecuentes** desde tu inicio. Agrega «¿Hacen canceles para baño?» con las palabras clave «cancel, baño, regadera». Ana la ve en su chat al recargar, y si escribe «Quiero un cancel para el baño», se la sugiere.
6. **Apagar** deja de ofrecer una pregunta sin borrarla. Cada pregunta dice cuántas dudas resolvió sola.

## Ejemplo de contribución

Un pull request que solo agrega documentación:

- Título: `docs(ejemplos): agregar ejemplo de cierre de sesion`
- Etiqueta: `documentacion`
- Descripción: qué cambia, por qué y cómo se verificó.

Un pull request que rompe algo que ya funcionaba:

- Título: `feat(login)!: pedir correo y contraseña de la empresa`
- Etiquetas: `nueva-funcion` y `cambio-incompatible`
- Efecto: aparece en la categoría «Cambios incompatibles» de las notas y se anota en el CHANGELOG.
