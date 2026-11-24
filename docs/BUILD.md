# Cómo se genera la entrega

Guía para empaquetar y publicar cada versión del Portal de Proyectos.

## Qué tipo de entrega corresponde

| Tipo de aplicación | Archivo de entrega | Se usa en |
| :--- | :--- | :--- |
| Aplicación web | ZIP con los archivos que abre el navegador | Cualquier navegador, o un servidor web |
| Aplicación móvil Android | APK, o AAB para la Play Store | Teléfonos Android |
| Aplicación móvil iOS | IPA | iPhone, firmada con una cuenta de Apple Developer |

El Portal de Proyectos es una **aplicación web** con dos partes, como indica `docs/CONTAINERS.md`: la aplicación que abre el navegador (`frontend/`, con HTML, CSS y JavaScript) y la API (`backend/`, con Node.js, Express y MySQL). Ninguna de las dos se compila: el navegador abre los archivos tal cual y la API se ejecuta con `npm start` (por eso `npm run build` no hace nada). Por eso **la entrega es un ZIP** con el código.

No corresponde un APK ni un IPA porque no hay una aplicación móvil nativa. Si más adelante el módulo se hace con Expo React Native, como prevé `AGENTS.md`, el APK y el IPA se generarían con `eas build` y esta guía se actualizaría.

## Qué lleva el ZIP

El archivo se llama `portal-proyectos-vX.Y.Z.zip` y contiene una carpeta `portal-proyectos-vX.Y.Z/` con:

- `frontend/`: la aplicación web, una página por pantalla con sus estilos y su JavaScript.
- `backend/`: la API, con `package.json` y `package-lock.json`, el esquema de la base (`database/schema.sql`), `docker-compose.yml` para levantar MySQL, los scripts de datos de prueba, las pruebas y `.env.example` con los nombres de las variables.
- `README.md`: cómo instalarla y usarla.
- `CHANGELOG.md`: qué cambió en cada versión.

No lleva la carpeta `docs/` ni la configuración del repositorio, porque no se necesitan para usar la aplicación. Tampoco lleva `backend/.env`, `node_modules`, los archivos que suben los usuarios ni el reporte de cobertura: no están en el repositorio, y `git archive` solo toma lo que está en él. Las dependencias se instalan con `npm ci`, y cada quien crea su `.env` a partir de `.env.example`.

## Cómo se genera

El ZIP se genera desde el tag de la versión, con `git archive`. Así solo entra lo que está en el repositorio en esa versión, sin archivos locales como `.DS_Store`. Funciona igual en macOS, Linux y Windows (Git Bash o PowerShell).

Ejemplo para la versión 0.2.0:

```bash
git checkout main
git pull --no-rebase
git fetch --tags
git archive --format=zip --prefix=portal-proyectos-v0.2.0/ -o portal-proyectos-v0.2.0.zip v0.2.0 frontend backend README.md CHANGELOG.md
```

## Cómo se verifica

Se necesitan Node.js 20 o superior, Docker Desktop y VS Code con Live Server, como indica el README.

1. Descomprime `portal-proyectos-v0.2.0.zip` y abre la carpeta `portal-proyectos-v0.2.0` en VS Code.
2. Prepara la API:

   ```bash
   cd backend
   npm ci
   npm test
   ```

   Las pruebas no necesitan MySQL y deben pasar todas.
3. Copia `backend/.env.example` como `backend/.env` y llena el usuario y la contraseña de MySQL y `JWT_SECRET`. Luego levanta la base, carga los datos de prueba y enciende la API:

   ```bash
   docker compose up -d
   node scripts/datos-prueba.js
   npm start
   ```

   `http://localhost:3000/api/salud` debe responder con `"ok": true`.
4. Abre `frontend/index.html` con **Open with Live Server**.
5. Entra como arquitecto y como cliente con las cuentas que mostró `datos-prueba.js`. Cada uno debe ver solo lo que le corresponde: el arquitecto, a sus clientes con el semáforo; el cliente, sus propios proyectos.

Para que quien descargue el ZIP pueda comprobar que no se alteró, se publica también su huella SHA-256:

```bash
shasum -a 256 portal-proyectos-v0.2.0.zip
```

En Windows: `certutil -hashfile portal-proyectos-v0.2.0.zip SHA256`.

## Cómo se publica

Cada versión sigue [Versionado Semántico](https://semver.org/lang/es/) con el formato `vX.Y.Z` y se publica en [Releases](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases):

1. Elige el número. Mientras el proyecto sea prototipo (`0.y.z`), las funciones o documentos nuevos suben el número de en medio (`0.2.0`) y las correcciones suben el último (`0.2.1`).
2. Genera las notas: en **Releases** → **Draft a new release**, escribe el tag nuevo y da clic en **Generate release notes**. GitHub las agrupa por etiqueta según `.github/release.yml`.
3. Edita las notas: agrega un resumen al inicio y la forma de probar la versión, y corrige lo que haya quedado en «Otros cambios».
4. Copia las notas al `CHANGELOG.md`, en una sección nueva `[X.Y.Z] - AAAA-MM-DD` con el formato de Keep a Changelog, mediante un pull request. Después intégralo a `main`.
5. Con el CHANGELOG ya en `main`, crea el tag sobre `main` y genera el ZIP desde ese tag, como se explica arriba.
6. Publica la release con el tag, las notas editadas y el ZIP adjunto. Escribe en las notas su huella SHA-256.
