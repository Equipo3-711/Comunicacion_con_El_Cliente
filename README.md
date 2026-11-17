
# Comunicacion_con_El_Cliente

Módulo de Comunicación con el Cliente. Equipo 3, Grupo 711.

Prototipo del **Portal de Proyectos** de una vidriería. El personal registra las solicitudes de sus clientes y les da seguimiento, y cada cliente consulta la información autorizada de su obra.

Esta versión es un prototipo hecho con HTML, CSS y JavaScript, sin servidor.

Versión actual y cambios: [Releases](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases) y [CHANGELOG](CHANGELOG.md).

## Requisitos

- Git, para clonar el repositorio.
- Un navegador actualizado: Chrome, Edge, Firefox o Safari.
- Opcional: Visual Studio Code con la extensión Live Server.

No hay dependencias que instalar ni nada que compilar.

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

1. Abre `login/index.html` en el navegador con doble clic. En VS Code también puedes dar clic derecho sobre el archivo y elegir **Open with Live Server**.
2. Entra con uno de los usuarios de prueba que aparecen en la misma pantalla de inicio: uno es administrador y el otro es cliente.
3. El administrador ve la información del proyecto y la información privada de la empresa. El cliente solo ve la información autorizada de su proyecto.
4. El botón de chat abre la ventana de mensajes, y **Cerrar sesión** regresa al inicio.

Los usuarios de prueba son datos de ejemplo del prototipo, definidos en `login/script.js`; no son cuentas reales.

Hay más ejemplos paso a paso en [docs/EJEMPLOS.md](docs/EJEMPLOS.md).

## Estructura del repositorio

| Carpeta o archivo | Contenido |
| :--- | :--- |
| `login/` | Maqueta del inicio de sesión por roles: `index.html`, `styles.css` y `script.js`. |
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
