# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto sigue el [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

- Bandeja de **Solicitudes** para el personal: todo lo que piden los clientes, con su canal de origen (portal, WhatsApp, llamada, redes sociales, correo o en persona), su categoría, su responsable y su estado. El personal registra en un solo formulario lo que llega por fuera del portal, y quien recibe una solicitud asignada se entera en su campana (T-26: RF-01, RF-04, RF-05, RF-12, RNF-01).
- Seguimiento de la cotización: el personal ve su detalle con los planos y la marca como Recibida, En revisión o Enviada. El cliente la modifica mientras no tenga proyecto, y el cambio entra a la bandeja como modificación. Al abrir el proyecto desde la cotización, quedan ligados (T-26: RF-11).
- Segunda cuenta del personal y solicitudes de ejemplo en los datos de prueba.

### Changed

- La base de datos tiene la tabla `solicitudes` y dos columnas nuevas en `cotizaciones`. Para cargar el esquema en una base local que ya existe: `docker compose down -v` y `docker compose up -d` (borra los datos de prueba).

### Fixed

- Los nombres de archivo con acentos o «ñ» se guardaban mal (por ejemplo, «plano baÃ±o.pdf»). Afectaba a los planos de la cotización y a los documentos del proyecto.

## [0.2.0] - 2026-11-24

El Portal de Proyectos deja de ser una maqueta: la aplicación web con las interfaces V2 ya funciona conectada a una API con base de datos, y cada pull request pasa por pruebas, análisis estático y revisión de seguridad. Son las notas de la [release v0.2.0](https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases/tag/v0.2.0), editadas a mano.

### Added

- API del portal en `backend/`, con Node.js, Express y MySQL: registro e inicio de sesión por rol, cotización con formulario, proyectos con historial, actualizaciones y actividades realizadas, documentos que se ven sin descargarse, chat para dudas, campana de pendientes y aviso por correo (#91).
- Semáforo de atención de las dudas, alta de clientes por el arquitecto, fotos opcionales en los avances y nombre de la empresa en la cuenta (#102).
- Aplicación web en `frontend/` con las interfaces V2, conectada a la API, para el cliente y para el arquitecto (#103).
- MySQL con Docker y datos de prueba para probar la aplicación en local (#101).
- Flujo de calidad en GitHub Actions: pruebas con umbral de cobertura (#95), ESLint con límite de complejidad 10 (#105) y revisión de dependencias y secretos con npm audit y Gitleaks (#104). Los umbrales acordados y cómo ejecutar todo están en `docs/PRUEBAS.md` (#96).
- Reglas de ramas y pull requests en `docs/ACUERDOS.md`: rama principal con revisión (#89), nombres de las ramas (#93) y borrado de ramas (#92), y su resumen en el README (#78).
- Plantilla de pull request (#88) y guía de entrega en `docs/BUILD.md` (#87).
- Requerimientos de seguimiento y avisos al cliente (#64), registro obligatorio y formulario de cotización (#57), interfaces V2 del cliente (#76) y diagramas C4 con historial por proyecto (#75) y avisos por correo (#74).

### Fixed

- Nombres de las imágenes de diseño y fila de RF-08 en los requerimientos (#80).

### Security

- La API revisa el contenido real de cada archivo subido, no solo el tipo que dice el navegador: documentos y cotizaciones (#97) y fotos de los avances (#107).

### Removed

- La maqueta del inicio de sesión en `login/`, reemplazada por la aplicación web de `frontend/` (#103).

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
