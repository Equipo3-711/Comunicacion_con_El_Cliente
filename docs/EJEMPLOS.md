# Ejemplos de uso

Recorridos paso a paso del Portal de Proyectos, con la aplicación web (`frontend/`) conectada a la API (`backend/`). Para instalar y comenzar a usar el proyecto, consulta el [README](../README.md).

Antes de empezar, levanta la API, carga los datos de prueba con `node scripts/datos-prueba.js` y abre `frontend/index.html` con Live Server. Todas las cuentas de prueba usan la contraseña que escribiste al cargar los datos.

## Ejemplo 1: datos incorrectos

1. Escribe un correo o una contraseña que no existan y da clic en **Iniciar sesión**.
2. Aparece «Correo o contraseña incorrectos.», sin decir cuál de los dos datos falló (HU-19, T-08).

## Ejemplo 2: el cliente consulta su proyecto

1. Entra con `ana@roble.test`. Se abre **Mis proyectos** con sus dos obras; cada una dice si su duda está «Atendido» o «Pendiente».
2. Da clic en **Ver proyecto** en «Ventanas · Calle Roble 12».
3. Se ven el presupuesto, los pagos realizados, la garantía y el historial con fecha y responsable de cada movimiento (RF-06, RF-08).
4. En **Documentos**, da clic en **Ver** junto a «Contrato». El documento se muestra dentro del portal, sin botones de descargar ni imprimir (CC-02).

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
3. Si el cliente ya creó su cuenta (por ejemplo, porque mandó una cotización), usa **Cliente ya registrado** y elige su empresa. Desde **Cotizaciones recibidas**, **Abrir proyecto** llena la empresa y el tipo de trabajo.

## Ejemplo de contribución

Un pull request que solo agrega documentación:

- Título: `docs(ejemplos): agregar ejemplo de cierre de sesion`
- Etiqueta: `documentacion`
- Descripción: qué cambia, por qué y cómo se verificó.

Un pull request que rompe algo que ya funcionaba:

- Título: `feat(login)!: pedir correo y contraseña de la empresa`
- Etiquetas: `nueva-funcion` y `cambio-incompatible`
- Efecto: aparece en la categoría «Cambios incompatibles» de las notas y se anota en el CHANGELOG.
