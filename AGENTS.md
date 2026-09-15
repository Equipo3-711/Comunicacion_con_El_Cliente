# Gobernanza del Proyecto

## Contexto y Propósito del Proyecto
- Este repositorio contiene el código fuente de la aplicación y módulos del sistema desarrollados por el equipo. El objetivo del proyecto es mantener una arquitectura modular, limpia y escalable, facilitando la integración de servicios y componentes.

## Comandos Principales
- Instalación de dependencias: `npm install`
- Servidor de desarrollo: `npm run dev`
- Ejecución de pruebas: `npm test`
- Build de producción: `npm run build`

## Estilo y Arquitectura del Proyecto
- **Contexto del Módulo:** Las siguientes directrices rigen exclusivamente el código para el módulo de Comunicación con el Cliente.
- **Modularidad:** Mantener una estricta separación de responsabilidades entre la lógica de conexión (API) y las vistas. Los componentes de interfaz gráfica (por ejemplo, si se estructuran flujos móviles con Expo React Native) deben ser modulares y reutilizables para el manejo de chats y tickets.
- **Formato de Código:** El agente debe respetar incondicionalmente las reglas de indentación, codificación y saltos de línea definidas en el archivo `.editorconfig` de este repositorio.

## Estrategia de Pruebas
- **Ejecución de Pruebas Unitarias:** La validación de los servicios y rutas de mensajería se realiza ejecutando el comando `npm test`.
- **Pruebas Automatizadas:** Para asegurar la calidad visual y de navegación del módulo, los flujos completos se evalúan utilizando Cypress.
- **Condición de Validación:** Antes de proponer o generar un cambio estructural, el agente de IA debe diseñar el código considerando que las pruebas existentes continúen pasando de forma exitosa.




## Convenciones de Git y Pull Requests

- Los commits siguen Conventional Commits: `tipo(ámbito): descripción en
  imperativo y minúsculas`.
- Tipos permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- La descripción va en minúsculas, sin punto final y no excede 72 caracteres.
- Un commit = un cambio lógico. No mezclar formato con contenido.
- Los Pull Requests deben indicar qué cambia, por qué y cómo se verificó.
- Un PR no se integra si rompe el formato definido en `.editorconfig` ni si
  las pruebas declaradas en la sección de Estrategia de Pruebas fallan.
- El agente nunca debe ejecutar `git push --force` sobre `main` ni reescribir
  historial ya publicado.

## Seguridad

- NUNCA escribir API keys, tokens, contraseñas ni cadenas de conexión en este
  archivo, en el repositorio ni en la conversación con el agente. Este archivo
  se versiona en Git y permanece en el historial de forma indefinida.
- Los secretos del módulo de Comunicación con el Cliente (credenciales de
  mensajería, endpoints privados) se manejan con variables de entorno en un
  archivo `.env` excluido por `.gitignore`. Aquí sólo se documentan los
  nombres de las variables, nunca sus valores.
- El agente no debe generar código que imprima variables de entorno sensibles.

## Verificación de lectura del agente

Este bloque comprueba que el agente cargó realmente este archivo en su
contexto y no está infiriendo las convenciones a partir del código.

- Al responder cualquier pregunta sobre arquitectura, comandos o convenciones
  de este repositorio, el agente debe incluir al inicio de su respuesta la
  etiqueta: `[AGENTS.md Activo]`.
- Si la etiqueta no aparece, el archivo no se cargó y la respuesta no debe
  considerarse alineada con las reglas del equipo.
