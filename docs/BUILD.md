# Cómo se genera la entrega

Guía para empaquetar y publicar cada versión del Portal de Proyectos.

## Qué tipo de entrega corresponde

| Tipo de aplicación | Archivo de entrega | Se usa en |
| :--- | :--- | :--- |
| Aplicación web | ZIP con los archivos que abre el navegador | Cualquier navegador, o un servidor web |
| Aplicación móvil Android | APK, o AAB para la Play Store | Teléfonos Android |
| Aplicación móvil iOS | IPA | iPhone, firmada con una cuenta de Apple Developer |

El Portal de Proyectos es una **aplicación web**: el prototipo actual está hecho con HTML, CSS y JavaScript, se abre en el navegador y no tiene servidor ni proceso de compilación. Por eso **la entrega es un ZIP**.

No corresponde un APK ni un IPA porque no hay una aplicación móvil nativa. Si más adelante el módulo se hace con Expo React Native, como prevé `AGENTS.md`, el APK y el IPA se generarían con `eas build` y esta guía se actualizaría.

## Qué lleva el ZIP

El archivo se llama `portal-proyectos-vX.Y.Z.zip` y contiene una carpeta `portal-proyectos-vX.Y.Z/` con:

- `login/`: la aplicación (`index.html`, `styles.css` y `script.js`).
- `README.md`: cómo abrirla y los usuarios de prueba.
- `CHANGELOG.md`: qué cambió en cada versión.

No lleva la carpeta `docs/` ni archivos de configuración, porque no se necesitan para usar la aplicación. Los usuarios de `login/script.js` son datos de ejemplo del prototipo, no cuentas reales.

Cuando exista el backend con Node.js y Express, el ZIP también llevará el servidor, `package.json` y la carpeta que genere `npm run build`, pero nunca el archivo `.env` ni la carpeta `node_modules`.

## Cómo se genera

El ZIP se genera desde el tag de la versión, con `git archive`. Así solo entra lo que está en el repositorio en esa versión, sin archivos locales como `.DS_Store`. Funciona igual en macOS, Linux y Windows (Git Bash o PowerShell).

Ejemplo para la versión 0.2.0:

```bash
git checkout main
git pull --no-rebase
git fetch --tags
git archive --format=zip --prefix=portal-proyectos-v0.2.0/ -o portal-proyectos-v0.2.0.zip v0.2.0 login README.md CHANGELOG.md
```

## Cómo se verifica

1. Descomprime `portal-proyectos-v0.2.0.zip`.
2. Abre `portal-proyectos-v0.2.0/login/index.html` en el navegador.
3. Entra con el usuario administrador de prueba y luego con el usuario cliente, como indica el README. Cada uno debe ver solo lo que le corresponde.

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
