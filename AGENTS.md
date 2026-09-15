## Estilo y Arquitectura del Proyecto
- **Contexto del Módulo:** Las siguientes directrices rigen exclusivamente el código para el módulo de Comunicación con el Cliente.
- **Modularidad:** Mantener una estricta separación de responsabilidades entre la lógica de conexión (API) y las vistas. Los componentes de interfaz gráfica (por ejemplo, si se estructuran flujos móviles con Expo React Native) deben ser modulares y reutilizables para el manejo de chats y tickets.
- **Formato de Código:** El agente debe respetar incondicionalmente las reglas de indentación, codificación y saltos de línea definidas en el archivo `.editorconfig` de este repositorio.

## Estrategia de Pruebas
- **Ejecución de Pruebas Unitarias:** La validación de los servicios y rutas de mensajería se realiza ejecutando el comando `npm test`.
- **Pruebas Automatizadas:** Para asegurar la calidad visual y de navegación del módulo, los flujos completos se evalúan utilizando Cypress.
- **Condición de Validación:** Antes de proponer o generar un cambio estructural, el agente de IA debe diseñar el código considerando que las pruebas existentes continúen pasando de forma exitosa.

# Gobernanza del Proyecto

## Contexto y Propósito del Proyecto
- Este repositorio contiene el código fuente de la aplicación y módulos del sistema desarrollados por el equipo. El objetivo del proyecto es mantener una arquitectura modular, limpia y escalable, facilitando la integración de servicios y componentes.

## Comandos Principales
- Instalación de dependencias: `npm install`
- Servidor de desarrollo: `npm run dev`
- Ejecución de pruebas: `npm test`
- Build de producción: `npm run build`
