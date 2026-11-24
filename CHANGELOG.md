# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto sigue el [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

- API del portal en `backend/`, con Node.js, Express y MySQL. Incluye registro e inicio de sesión por rol, cotización con formulario, proyectos con historial, actualizaciones y actividades realizadas, documentos que se ven sin descargarse, chat para dudas, campana de pendientes y aviso por correo (#91).
- Aplicación web en `frontend/` con las interfaces V2, conectada a la API: inicio de sesión y registro, mis proyectos, cotización, detalle con historial y fotos, visor de documentos sin descarga, chat, campana de pendientes y, para el arquitecto, sus clientes, el registro de avances y el semáforo de atención.
- Semáforo de atención de las dudas (No atendido, Pendiente y Atendido), que cambia solo con el chat y el arquitecto ajusta a mano.
- Alta de clientes por el arquitecto, con su empresa y su primer proyecto (RF-02).
- Fotos opcionales en las actualizaciones del proyecto (RF-07).
- MySQL con Docker (`backend/docker-compose.yml`) y datos de prueba (`backend/scripts/datos-prueba.js`) para probar la aplicación en local.

### Removed

- La maqueta del inicio de sesión en `login/`, reemplazada por la aplicación web de `frontend/`.

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

[Unreleased]: https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Equipo3-711/Comunicacion_con_El_Cliente/releases/tag/v0.1.0
