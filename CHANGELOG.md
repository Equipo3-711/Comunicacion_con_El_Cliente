# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto sigue el [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

## [0.2.0] - 2026-11-17

Segunda versión del Portal de Proyectos, todavía en prototipo. Integra los cambios que pidió el cliente en la revisión de avances y define el flujo de ramas y de entrega del equipo. Son las notas de la [release v0.2.0](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases/tag/v0.2.0), editadas a mano. Desde esta versión, la entrega es el archivo `portal-proyectos-v0.2.0.zip`.

### Added

- Requerimientos RF-16 a RF-19 e historias HU-20 a HU-23: seguimiento con actualizaciones estructuradas, publicación de lo realizado sin conversación, campana de pendientes y aviso por correo al cliente (#64).
- Sección «Formulario de cotización» en `docs/REQUERIMIENTOS.md`, con los campos, cuáles son obligatorios y sus reglas (#57).
- Interfaces versión 2 en `docs/diseno/`: login, crear cuenta, inicio del cliente, cotización, detalles del proyecto, notificaciones, chat del cliente e inicio del arquitecto (#76).
- Reglas de rama principal con revisión obligatoria, de borrado de ramas y de nombre de ramas en `docs/ACUERDOS.md` (#82).
- Plantilla de pull request en `docs/pull_request_template.md` (#82).
- Guía para generar y publicar la entrega en `docs/BUILD.md`, y el ZIP adjunto a cada release (#82).
- Regla para nombrar las ramas con el identificador de su issue en la sección «Cómo contribuir» del README (#78).

### Changed

- El registro es obligatorio antes de solicitar una cotización: cambian RF-02, RF-03, HU-02 y HU-03 (#57).
- RF-06 y HU-06 pasan a un historial por proyecto de lo que ha sucedido, y el diagrama de contenedores agrega el seguimiento y las campanas (#75).
- El diagrama de contexto agrega el aviso por correo al cliente y deja registrado que el seguimiento con IA está pospuesto (#74).
- RF-08 y HU-08: los documentos del proyecto se pueden ver, pero no descargar (#76).
- La carpeta de interfaces cambia de `docs/diseño/` a `docs/diseno/` (#76).

### Fixed

- La fila de RF-08 en la tabla de requerimientos y los nombres de `inicioCliente_V2.png` y `detallesProyecto_V2.png` (#80).

## [0.1.0] - 2026-10-29

Primera versión documentada del Portal de Proyectos, todavía en prototipo. Son las notas de la [release v0.1.0](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases/tag/v0.1.0), editadas a mano.

### Added

- Maqueta del inicio de sesión por roles, con vista de administrador y de cliente, en `login/`.
- Primera versión de las interfaces del portal, exportadas como imágenes en `docs/diseño/`.
- Diagramas C4 de contexto y de contenedores en `docs/CONTEXT.md` y `docs/CONTAINERS.md` (#42).
- Definición de terminado de las tareas en `docs/ACUERDOS.md` (#28).
- Roles del equipo en el README (#31).
- Documentación del proyecto: entrevista, requerimientos, historias de usuario, riesgos, acuerdos, definición de terminado y retrospectivas en `docs/`.
- Categorías para las notas automáticas de cada versión en `.github/release.yml` (#45).
- Este CHANGELOG, con el formato de Keep a Changelog (#46).
- Instrucciones de instalación y uso en el README (#47).
- Ejemplos de uso y de contribución en `docs/EJEMPLOS.md` (#44).

[Unreleased]: https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases/tag/v0.1.0
