
# Comunicacion_con_El_Cliente

Módulo de Comunicación con el Cliente. Equipo 3, Grupo 711.

**Portal de Proyectos** de una vidriería. El personal registra las solicitudes de sus clientes y les da seguimiento, y cada cliente consulta la información autorizada de su obra.

Tiene dos partes, como indica el [diagrama de contenedores](docs/CONTAINERS.md): la aplicación web en `frontend/` (React, TypeScript y Vite) y la API en `backend/` (Node.js, Express y MySQL).

Versión actual y cambios: [Releases](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases) y [CHANGELOG](CHANGELOG.md).

## Requisitos

- Git, para clonar el repositorio.
- Un navegador actualizado: Chrome, Edge, Firefox o Safari.
- Node.js 22 o superior, para la aplicación web y la API.
- Docker Desktop, para la base de datos de la API. Ver [API del portal](#api-del-portal-backend).

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Equipo3-711/Comunicacion_con_El_Cliente.git
   ```

2. Entra a la carpeta:

   ```bash
   cd Comunicacion_con_El_Cliente
   ```

También puedes descargar una versión publicada desde [Releases](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases): baja el archivo `portal-proyectos-vX.Y.Z.zip` de la versión más reciente y descomprímelo. Cómo se genera ese archivo está en [docs/BUILD.md](docs/BUILD.md).

## Uso

1. Levanta la API con sus datos de prueba, como se explica en [API del portal](#api-del-portal-backend).
2. En otra terminal, levanta la aplicación web, como se explica en [Aplicación web](#aplicación-web-frontend):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Se abre en `http://localhost:5173`. Funciona igual en la computadora, la tableta y el celular.
3. Entra con una de las cuentas que creó `node scripts/datos-prueba.js`, con la contraseña que escribiste al cargarlas:
   - **Arquitecto** (`arquitecto@tefficiency.test`): ve a sus clientes con el semáforo de atención, agrega clientes, registra avances con fotos, marca actividades como realizadas, sube documentos y responde dudas. En **Solicitudes** registra lo que llega por WhatsApp, llamada, redes sociales, correo o en persona, lo clasifica y lo asigna; también avanza cada cotización y ve los planos del cliente. En **Preguntas frecuentes** configura las respuestas automáticas del chat.
   - **Personal** (`paola@tefficiency.test`): otra persona del personal, para probar la asignación de solicitudes.
   - **Cliente** (`ana@roble.test`): ve sus proyectos con presupuesto, pagos, garantía, historial y documentos, solicita cotizaciones, las modifica si quiere cambios y escribe sus dudas en el chat, donde un asistente virtual le contesta las preguntas frecuentes.

   También puedes crear tu propia cuenta de cliente con **Crear cuenta**.

| Pantalla | Dirección | Archivo |
| :--- | :--- | :--- |
| Iniciar sesión y crear cuenta | `/` y `/registro` | `frontend/src/paginas/Login.tsx` y `Registro.tsx` |
| Mis proyectos y cotizaciones del cliente | `/cliente` | `frontend/src/paginas/cliente/MisProyectos.tsx` |
| Solicitar o modificar cotización | `/cliente/cotizacion` y `/cliente/cotizacion/:id` | `frontend/src/paginas/cliente/Cotizacion.tsx` |
| Detalle del proyecto, visor de documentos y chat del cliente | `/cliente/proyectos/:id` | `frontend/src/paginas/cliente/` |
| Mis clientes y cotizaciones recibidas | `/arquitecto` | `frontend/src/paginas/arquitecto/Inicio.tsx` |
| Solicitudes | `/arquitecto/solicitudes` | `frontend/src/paginas/arquitecto/Solicitudes.tsx` |
| Preguntas frecuentes del chat | `/arquitecto/preguntas` | `frontend/src/paginas/arquitecto/Preguntas.tsx` |
| Detalle de la cotización, proyecto y chat del arquitecto | `/arquitecto/cotizaciones/:id` y `/arquitecto/proyectos/:id` | `frontend/src/paginas/arquitecto/` |
| Campana de pendientes | En el encabezado de todas las pantallas con sesión | `frontend/src/componentes/Campana.tsx` |
| Correo de aviso | Lo envía la API (`backend/src/services/notificaciones.service.js`) |

Hay más ejemplos paso a paso en [docs/EJEMPLOS.md](docs/EJEMPLOS.md).

## Aplicación web (frontend)

La carpeta `frontend/` tiene la aplicación que abre el navegador. Está hecha con React y TypeScript, y Vite la levanta en desarrollo y la compila para publicarla. Se adapta a celular, tableta y computadora.

### Cómo levantarla

1. Levanta primero la API (ver [API del portal](#api-del-portal-backend)), en `http://localhost:3000`.
2. Instala las dependencias y levanta la aplicación:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Abre `http://localhost:5173`.

En desarrollo, Vite pasa cada petición a `/api` hacia `http://localhost:3000`, así que no hay que configurar nada más. Si la API está en otro puerto, levanta la aplicación con `VITE_API_PROXY=http://localhost:PUERTO npm run dev`. Si la aplicación se publica en un servidor distinto al de la API, la dirección se indica al compilar con `VITE_API_URL=https://servidor/api npm run build`.

### Comandos

Se ejecutan **dentro de `frontend/`**:

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Levanta la aplicación en `http://localhost:5173` y la recarga al guardar cambios. |
| `npm test` | Corre las pruebas unitarias con Vitest. No necesita la API. |
| `npm run e2e` | Corre los flujos completos con Cypress. Necesita `npm run dev` encendido; las respuestas de la API se simulan. |
| `npm run cypress` | Abre Cypress con su ventana, para ver cada prueba paso a paso. |
| `npm run lint` | Análisis estático con ESLint. |
| `npm run tipos` | Revisa los tipos de TypeScript. |
| `npm run build` | Revisa los tipos y compila la aplicación en `frontend/dist/`. |
| `npm run preview` | Sirve lo compilado en `http://localhost:4173`, para probarlo antes de publicarlo. |

### Cómo está organizada

La conexión con la API está separada de las vistas, como pide `AGENTS.md`:

| Carpeta o archivo | Qué hace |
| :--- | :--- |
| `src/api/` | Única carpeta que hace peticiones a la API. Cada tema (proyectos, cotizaciones, solicitudes…) tiene sus funciones. |
| `src/tipos.ts` | Forma de los datos que entrega la API. Si la API cambia un campo, TypeScript marca cada pantalla que lo usa. |
| `src/sesion/` | Guarda la sesión en el navegador y revisa el rol de cada pantalla. |
| `src/componentes/` | Piezas que se reutilizan: encabezado con la campana, chat, historial con fotos, visor de documentos, diálogos y avisos. |
| `src/hooks/` | Lógica que comparten las pantallas: cargar datos, enviar formularios y repetir tareas. |
| `src/paginas/` | Una pantalla por archivo, en `cliente/` y `arquitecto/`. |
| `src/utilidades/` | Textos de cada estado, formatos de fecha y dinero, y a dónde lleva cada pendiente. |
| `src/estilos.css` | Colores, tema claro y oscuro, componentes de las interfaces V2 y los ajustes para tableta y celular. |
| `cypress/` | Flujos completos y revisión responsiva con Cypress. |

## API del portal (backend)

La carpeta `backend/` tiene la API que usa la aplicación web, como indica el [diagrama de contenedores](docs/CONTAINERS.md). Está hecha con Node.js y Express, guarda los datos en MySQL, y las fotos y documentos en una carpeta del servidor.

### Requisitos

- Node.js 22 o superior.
- Docker Desktop, que levanta MySQL 8 sin instalarlo. También sirve un MySQL 8 instalado en la computadora.

### Cómo levantarla

Los comandos de `AGENTS.md` (`npm install`, `npm run dev`, `npm test` y `npm run build`) existen en `backend/` y en `frontend/`. Los de esta sección se ejecutan **dentro de `backend/`**.

1. Instala las dependencias:

   ```bash
   cd backend
   npm install
   ```

2. Copia `backend/.env.example` como `backend/.env` y llena los valores: un usuario y una contraseña para MySQL, y una frase larga y aleatoria en `JWT_SECRET`. El archivo `.env` nunca se sube al repositorio.

3. Levanta MySQL con Docker. La primera vez crea la base con el usuario y la contraseña del `.env`, y carga `database/schema.sql`:

   ```bash
   docker compose up -d
   ```

   Si ya tienes otro MySQL ocupando el puerto 3306, pon `DB_PORT=3307` en el `.env` antes de levantarlo. Para borrar los datos y volver a cargar el esquema: `docker compose down -v` y otra vez `docker compose up -d`.

   <details>
   <summary>Sin Docker, con un MySQL instalado</summary>

   ```bash
   mysql -u TU_USUARIO -p -e "CREATE DATABASE portal_proyectos CHARACTER SET utf8mb4"
   mysql -u TU_USUARIO -p portal_proyectos < database/schema.sql
   ```

   </details>

4. Carga los datos de prueba: dos personas del personal, tres clientes con sus proyectos, actividades, un documento, mensajes, una cotización, solicitudes y preguntas frecuentes. El script pide una contraseña para todas las cuentas, para que ninguna quede escrita en el repositorio, y al final muestra los correos con los que se entra:

   ```bash
   node scripts/datos-prueba.js
   ```

   Para crear solo una cuenta de administrador, sin datos de ejemplo, usa `npm run crear-admin`.

5. Levanta la API y comprueba que responde en `http://localhost:3000/api/salud`:

   ```bash
   npm run dev
   ```

Los clientes crean su propia cuenta con `POST /api/auth/registro`.

### Comandos

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Levanta la API y la reinicia al guardar cambios. |
| `npm start` | Levanta la API, sin reinicio automático. |
| `npm test` | Corre las pruebas. No necesita MySQL. |
| `npm run build` | No hace nada: la API no necesita compilarse. |
| `npm run crear-admin` | Crea una cuenta de administrador. |
| `node scripts/datos-prueba.js` | Llena la base con datos de ejemplo para probar la aplicación web. |
| `docker compose up -d` | Levanta MySQL en Docker con los datos del `.env`. |
| `ENV_FILE=.env.nube node scripts/cargar-esquema.js` | Carga las tablas en una base que no es la de Docker, por ejemplo la del despliegue. |

### Cómo está organizada

Cada petición pasa por cuatro capas, para mantener separada la conexión de las vistas, como pide `AGENTS.md`:

| Carpeta | Qué hace |
| :--- | :--- |
| `src/routes/` | Relaciona cada dirección con su controlador y revisa la sesión y el rol. |
| `src/controllers/` | Recibe la petición, valida los datos y responde. |
| `src/services/` | Aplica las reglas del negocio, por ejemplo que sin sesión no se cotiza. |
| `src/repositories/` | Hace las consultas SQL. Es la única capa que habla con MySQL. |

Además están `src/validators/` (reglas de cada formulario), `src/middlewares/` (sesión, rol y errores), `src/utils/` (archivos y correo), `database/schema.sql` (tablas), `tests/` (pruebas) y `api/index.js` con `vercel.json` (la misma API como función de Vercel).

### Rutas principales

Todas empiezan con `/api`. Salvo el registro, el inicio de sesión y la ruta de salud, piden el encabezado `Authorization: Bearer <token>` que devuelve el inicio de sesión.

| Ruta | Quién | Para qué | Requerimiento |
| :--- | :--- | :--- | :--- |
| `POST /auth/registro` | Cualquiera | Crear la cuenta de cliente con su empresa | RF-02, CC-01 |
| `POST /auth/login` | Cualquiera | Iniciar sesión; el rol decide qué puede hacer | RNF-06 |
| `POST /cotizaciones` | Cliente | Enviar el formulario de cotización, con fotos o planos opcionales | RF-03, CC-10 |
| `GET /cotizaciones` y `GET /cotizaciones/:id` | Ambos | El cliente ve las suyas; el personal, todas, con sus fotos o planos | RF-03 |
| `PUT /cotizaciones/:id` | Ambos | Modificar la cotización mientras no tenga proyecto; si ya se había enviado, vuelve a revisión | RF-11 |
| `PATCH /cotizaciones/:id/estado` | Personal | Recibida, En revisión o Enviada; al enviarla, sus solicitudes quedan atendidas | RF-03 |
| `GET /cotizaciones/archivos/:id/ver` | Ambos | Ver una foto o un plano de la cotización dentro del portal, sin descarga: el personal en el detalle y el cliente al modificarla | RF-03, CC-02 |
| `GET` y `POST /solicitudes` | Personal | Bandeja de solicitudes con filtros, y registrar las que llegan por fuera del portal con su canal | RF-01, RF-04, RNF-01 |
| `PATCH /solicitudes/:id` | Personal | Clasificar, cambiar el estado o asignar el responsable, que recibe el aviso | RF-04, RF-05, RF-12 |
| `GET /solicitudes/responsables` y `GET /clientes` | Personal | Listas para el formulario de solicitudes | RF-05 |
| `GET /proyectos` y `GET /proyectos/:id` | Ambos | Mis proyectos y su detalle, sin las notas internas para el cliente | RF-08, T-06 |
| `POST /proyectos` y `PATCH /proyectos/:id/estado` | Personal | Abrir un proyecto, opcionalmente ligado a la cotización de la que nace, y cambiar su estado | RF-07 |
| `POST /clientes` | Personal | Agregar un cliente a la cartera: su cuenta, su empresa y su primer proyecto | RF-02 |
| `PATCH /proyectos/:id/atencion` | Personal | Semáforo de las dudas: No atendido, Pendiente o Atendido | CC-04 |
| `GET /proyectos/:id/historial` | Ambos | Todo lo que ha sucedido en el proyecto, en orden de fecha | RF-06, CC-06 |
| `GET /proyectos/:id/resumen` | Ambos | Seguimiento automático: etapa, actividades realizadas, último movimiento, pagos, garantía y avisos, armados con los datos del proyecto | CC-05 |
| `POST /proyectos/:id/actualizaciones` | Personal | Registrar un avance con tipo, descripción, fecha, responsable y hasta 5 fotos opcionales | RF-16, RF-07 |
| `GET /fotos/:id/ver` | Ambos | Ver las fotos de un avance dentro del portal | RF-07 |
| `PATCH /actividades/:id/realizada` | Personal | Marcar una actividad como realizada y publicarla al cliente | RF-17, CC-07 |
| `GET /proyectos/:id/documentos` y `GET /documentos/:id/ver` | Ambos | Ver los documentos dentro del portal, sin descarga | RF-08, CC-02 |
| `GET` y `POST /proyectos/:id/mensajes` | Ambos | Chat del proyecto, solo para dudas | CC-04 |
| `GET /pendientes` | Ambos | Contador y lista de la campana | RF-18, CC-08 |
| `GET /preguntas` y `GET /preguntas/sugerencias?texto=` | Ambos | Preguntas frecuentes activas y las que se parecen a la duda del cliente | RF-13 |
| `POST /preguntas/:id/resuelta` | Cliente | «Sí, esto responde mi duda»: cuenta la duda resuelta | RF-13 |
| `POST`, `PUT` y `DELETE /preguntas` | Personal | Agregar, cambiar, apagar o borrar preguntas frecuentes | RF-13 |

Todo lo que piden los clientes entra a la bandeja de **Solicitudes**: la cotización y sus cambios llegan solos por el portal, y el personal registra lo que llega por WhatsApp, llamada, redes sociales, correo o en persona. La conexión automática con WhatsApp todavía no existe; el canal ya queda guardado para cuando se conecte.

En el chat del cliente, un **asistente virtual** le ofrece las **preguntas frecuentes** que configuró el personal, de 4 en 4 con flechas para pasar de página, y le contesta al momento; desde la respuesta regresa a las preguntas o habla con el arquitecto. Si escribe una duda con alguna de sus palabras clave, el chat le sugiere la respuesta y le pregunta si resolvió su duda; si no, su mensaje le llega al arquitecto como siempre. No usa inteligencia artificial: compara palabras sin importar acentos ni mayúsculas, así que no tiene costo y ningún dato sale del portal.

El semáforo de atención cambia solo con el chat: una duda nueva del cliente deja el proyecto en «No atendido» y la respuesta del arquitecto lo pasa a «Pendiente», hasta que él lo marca como «Atendido».

Cada actualización, cambio de estado, actividad realizada o documento nuevo le aparece al cliente en su campana y, si `SMTP_HOST` está configurado, le llega por correo (RF-19). Ver un documento no ofrece descargarlo, pero no puede impedir una captura de pantalla, como quedó acordado en CC-02.

## Estructura del repositorio

| Carpeta o archivo | Contenido |
| :--- | :--- |
| `frontend/` | Aplicación web con React, TypeScript y Vite. Ver [Aplicación web](#aplicación-web-frontend). |
| `backend/` | API del portal con Node.js, Express y MySQL. Ver [API del portal](#api-del-portal-backend). |
| `docs/` | Requerimientos, historias de usuario, riesgos, acuerdos, retrospectivas, diagramas C4 y ejemplos. |
| `docs/diseno/` | Interfaces del portal exportadas como imágenes. |
| `.github/release.yml` | Categorías de las notas automáticas de cada versión. |
| `CHANGELOG.md` | Cambios de cada versión. |
| `AGENTS.md` | Reglas del proyecto: arquitectura, pruebas, Git y seguridad. |
| `.editorconfig` | Formato de los archivos. |

## Documentación

- [Requerimientos](docs/REQUERIMIENTOS.md) e [historias de usuario](docs/HISTORIAS.md).
- [Diagrama de contexto](docs/CONTEXT.md) y [diagrama de contenedores](docs/CONTAINERS.md).
- [Riesgos](docs/RIESGOS.md), [acuerdos y definición de terminado](docs/ACUERDOS.md) y [retrospectivas](docs/RETROSPECTIVAS.md).
- [Ejemplos de uso](docs/EJEMPLOS.md).
- [Pruebas y calidad](docs/PRUEBAS.md).
- [Despliegue de prueba en Vercel](docs/DESPLIEGUE.md).

## Versiones

El proyecto usa [Versionado Semántico](https://semver.org/lang/es/) con el formato `MAYOR.MENOR.PARCHE`.

Cada versión se publica en [Releases](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases) sobre un tag `vX.Y.Z`, con notas generadas por GitHub y revisadas por el equipo.

El detalle de cada versión está en el [CHANGELOG](CHANGELOG.md).

## Cómo contribuir

1. Actualiza `main` con `git pull --no-rebase` y crea desde ahí una rama llamada `tipo/ID-descripcion`: el tipo de Conventional Commits, el identificador del issue que atiende y dos o tres palabras. Por ejemplo, `docs/CC-09-interfaces-v2` o `docs/T-14-flujo-de-ramas`.
2. Haz commits con [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/), por ejemplo `docs(readme): agregar instalacion`.
3. Abre un Pull Request con el mismo formato en el título y una etiqueta de tipo: `nueva-funcion`, `correccion`, `documentacion` o `mantenimiento`. Si rompe algo que ya funcionaba, agrega también `cambio-incompatible`.
4. En la descripción explica qué cambia, por qué y cómo se verificó, menciona el issue con `Relacionado con #N` y pide la aprobación de un compañero.
5. Con la aprobación, intégralo con **Create a merge commit**. GitHub borra la rama al integrarla; si sigue ahí, bórrala con **Delete branch**.
6. Si el cambio le importa a quien usa el proyecto, agrega una línea en la sección `Unreleased` del [CHANGELOG](CHANGELOG.md).

Ningún cambio llega a `main` sin Pull Request, y ninguna rama se queda con commits sin su Pull Request.

## Integrantes y roles

| Integrante | Usuario de GitHub | Rol |
| :--- | :--- | :--- |
| Alvarado Gonzalez Jairo Miguel | @Jairo0624 | Facilitador del trabajo y demostración del producto |
| Estrada Estrada Jorge | @jorgeestrada1302 | Equipo de desarrollo |
| Gutierrez Perez Ximena | @Xitony0407 | Responsable del producto y análisis |
| Navarrete Mexicano Grecia | @GreciaNM | Equipo de desarrollo |
| Pavon Ibarra Romina | @RominaPI | Equipo de desarrollo |

## Responsabilidades de cada rol

### Responsable del producto (también análisis)

- Representa al cliente dentro del equipo y decide qué se construye y en qué orden.
- Mantiene priorizado el backlog de requerimientos e historias de usuario.
- Define el objetivo de cada ciclo y lo publica en el tablero.
- Analiza la información del cliente y mantiene actualizados `docs/REQUERIMIENTOS.md` y `docs/HISTORIAS.md`.
- Acepta o rechaza el trabajo terminado según los criterios de aceptación.

### Facilitador del trabajo (también demostración del producto)

- Organiza la planeación y las reuniones del equipo.
- Mantiene el tablero al día y ayuda a quitar los obstáculos que frenan el trabajo.
- Vigila que se cumplan `docs/ACUERDOS.md` y la definición de terminado.
- Presenta la demostración del producto al cierre de cada ciclo.

### Equipo de desarrollo

- Estima, diseña, programa y prueba las tarjetas del ciclo.
- Mueve sus tarjetas en el tablero conforme avanza el trabajo.
- Trabaja en ramas propias y entrega sus cambios mediante Pull Request.
