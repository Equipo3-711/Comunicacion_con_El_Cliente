# Acuerdos de trabajo del equipo 

Vigencia: del 18 de agosto al 11 de septiembre

Revisión : al cierre de cada iteración

1. Cada integrante subirá su parte en su rama para revisión y posterior merge.
2. Compartir los avances y cambios del código para que todos estén informados sobre el progreso del proyecto.
3. Resolver los problemas en equipo, escuchando las propuestas de los demás y buscando la mejor solución para el proyecto.
4. Cumplir con las tareas asignadas en el tiempo establecido y avisar con anticipación si existe algún problema.
5. Mantener una comunicación constante, informar al equipo sobre avances, problemas o cambios importantes para evitar confusiones.
6. Actualizar el repositorio antes de trabajar
Antes de realizar cambios, ejecutar git pull para trabajar con la versión más reciente del proyecto.
7. Respetar y apoyar el trabajo de los demas
8. Revisar el codigo antes de subirlo 
9. Actualización obligatoria: Exigir que la rama esté al día con la rama base antes de integrar los cambios
10. Revisiones requeridas exigir al menos una o dos aprobaciones de compañeros
11. Mensajes descriptivos: Exigir un formato claro en los commits o ligarlos a tareas e incidencias (issues)

## Definición de terminado

Una tarea se considera terminada solo cuando cumple todo lo siguiente:

1. Cumple todos los criterios de aceptación de su historia de usuario, y los verificó alguien distinto de quien la desarrolló.
2. El comando `npm test` pasa sin errores y los flujos afectados se probaron con Cypress.
3. El código respeta las reglas de `.editorconfig`: finales de línea LF, UTF-8, indentación de 2 espacios y salto de línea al final del archivo.
4. Mantiene separada la lógica de conexión (API) de las vistas, como indica `AGENTS.md`.
5. Los commits siguen Conventional Commits, con un commit por cambio lógico.
6. La rama está actualizada con `main` antes de integrarse.
7. El Pull Request explica qué cambia, por qué y cómo se verificó, y tiene al menos una aprobación de un compañero.
8. No incluye llaves, tokens ni contraseñas; los secretos se manejan en un archivo `.env` fuera del repositorio.
9. La tarea está en la columna Done del tablero con sus horas reales registradas.
10. Si el cambio afecta requerimientos o historias, los documentos de `docs/` están actualizados.

## Ramas y pull requests

Reglas para trabajar con ramas y pull requests en este repositorio.

### Rama principal con revisión obligatoria

`main` es la rama principal y la única que se entrega. Ningún cambio se sube directo a `main`: todo llega por pull request, con al menos una aprobación de un integrante distinto del autor, y se integra con **Create a merge commit**. Mientras el repositorio sea privado con el plan gratuito, GitHub no permite exigirlo con una regla de protección, así que el equipo lo cumple por acuerdo y el facilitador lo revisa antes de cada integración.

### Borrado de ramas

Pendiente: la escribe Ximena (T-17).

### Nombre de las ramas

Pendiente: la escribe Grecia (T-18).
