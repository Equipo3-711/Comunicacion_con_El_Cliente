# Cierre del proyecto · Iteración 7

Equipo 3 · Grupo 711 · Módulo de Comunicación con el Cliente · Iteración 7 (16 al 29 de noviembre de 2026).

## Lo terminado y lo pendiente

### Ximena: seguimiento estructurado y campana

**Lo terminado:**

- **Campañas cuando hay algo pendiente (CC-08):** se completó la funcionalidad de avisos para situaciones pendientes del cliente.
- **Campana con pendientes (RF-18, HU-22):** se implementó la notificación para informar al cliente sobre actualizaciones y pendientes.
- **Seguimiento con un modelo (CC-04):** se completó el requerimiento de seguimiento solicitado por el cliente.
- **Actualizaciones estructuradas (RF-16, HU-20):** se completó el registro de actualizaciones estructuradas para facilitar el seguimiento del proyecto.

**Lo pendiente para la Iteración 8:**

- Definir con el cliente qué fechas importantes necesita registrar y quién tendrá autorización para modificarlas.
- Confirmar con la empresa los requisitos e información faltante para elaborar las propuestas.
- Validar la información recibida antes de continuar con las propuestas y evitar retrasos en el desarrollo.
## Guion de la presentación

Máximo 12 minutos. Jairo cuida el tiempo y avisa al minuto 6, al 7 y al 11.

| Tiempo | Bloque | Responsable | Qué se muestra |
| :--- | :--- | :--- | :--- |
| 0:00 a 1:00 | Apertura | Jairo | Equipo, módulo, objetivo de la iteración y lo comprometido (diapositiva 1). |
| 1:00 a 2:15 | Demostración | Jorge | Un cliente nuevo se registra, pide su cotización con un plano y llega a Solicitudes clasificada (CC-01, CC-10, HU-03, HU-01, HU-04). |
| 2:15 a 3:15 | Demostración | Grecia | Asigna la solicitud, marca una actividad como realizada y se ve en el historial (HU-05, CC-07, HU-21, CC-06, HU-06). |
| 3:15 a 4:15 | Demostración | Ximena | Registra un avance con foto y la campana del cliente lo muestra (CC-04, HU-20, CC-08, HU-22). |
| 4:15 a 4:45 | Demostración | Jairo | El correo de aviso llega al celular (CC-03, HU-23). |
| 4:45 a 6:00 | Demostración | Romina | El cliente ve su proyecto sin datos internos y abre un documento sin descarga (HU-08, HU-19, CC-02, HU-10). |
| 6:00 a 7:00 | Demostración | Jorge | El chat responde una pregunta frecuente y manda al arquitecto lo que no sabe (HU-13). |
| 7:00 a 8:00 | Pendientes | Ximena | Lo planeado contra lo terminado y las propuestas (diapositivas 2 y 3). |
| 8:00 a 12:00 | Preguntas | Todos | Contesta quien presentó esa parte; Jairo da la palabra. Lo que no sepamos se contesta por Slack. |

## Historias que se van a demostrar

Cada historia se demuestra en el bloque del guion que la menciona, con el criterio de aceptación que el cliente puede comprobar en pantalla. Los criterios vienen de `docs/HISTORIAS.md` y de la decisión de cada cambio del cliente (CC).

### Registro y cotización (Jorge)

| Historia | Criterio de aceptación |
| :--- | :--- |
| CC-01 | Cada cotización queda ligada a un cliente identificado: primero crea su cuenta, inicia sesión y luego cotiza. |
| CC-10 | El formulario de cotización define sus campos, cuáles son obligatorios y sus validaciones. |
| HU-03 | Dado que un cliente registrado llena el formulario de cotización, cuando falte un campo obligatorio, entonces el sistema debe marcarlo y conservar los datos ya capturados. |
| HU-01 | Dado que un cliente realiza una solicitud por cualquier canal, cuando el responsable la registre, entonces debe quedar almacenada con su origen identificado. |
| HU-04 | Dado que se registra una nueva solicitud, cuando se complete el registro, entonces debe asignarse una categoría válida. |

### Asignación, actividad realizada e historial (Grecia)

| Historia | Criterio de aceptación |
| :--- | :--- |
| HU-05 | Dado que existe una solicitud pendiente, cuando el coordinador la asigne, entonces debe quedar registrado el responsable y mostrarse quién está encargado. |
| CC-07 | Lo que el arquitecto marca como hecho le aparece al cliente sin necesidad de una conversación. |
| HU-21 | Dado que terminó una actividad, cuando el arquitecto la marque como realizada, entonces debe aparecer en el proyecto del cliente con fecha y responsable. |
| CC-06 | Cada proyecto muestra en orden de fecha lo que ha sucedido, sin buscarlo en conversaciones. |
| HU-06 | Dado que un proyecto tiene actividad registrada, cuando se consulte su historial, entonces debe mostrar en orden de fecha lo sucedido, con su tipo y responsable. |

### Seguimiento estructurado y campana (Ximena)

| Historia | Criterio de aceptación |
| :--- | :--- |
| CC-04 | Cada avance se registra como una actualización con tipo, descripción, fecha y responsable; el chat queda solo para dudas. |
| HU-20 | Dado que el proyecto tiene actualizaciones, cuando el cliente lo consulte, entonces debe ver el tipo, la descripción, la fecha y el responsable de cada una. |
| CC-08 | El usuario ve una campana cuando tiene algo pendiente. |
| HU-22 | Dado que existe algo pendiente, cuando el usuario entre al portal, entonces la campana debe mostrar cuántos pendientes tiene. |

### Aviso por correo (Jairo)

| Historia | Criterio de aceptación |
| :--- | :--- |
| CC-03 | El cliente recibe por correo el resumen de cada actualización y un enlace a su proyecto, sin entrar a la plataforma. |
| HU-23 | Dado que se publica una actualización, cuando se guarde, entonces el cliente debe recibir un correo con el resumen y un enlace a su proyecto. |

### Proyecto del cliente y documentos (Romina)

| Historia | Criterio de aceptación |
| :--- | :--- |
| HU-08 | Dado que el cliente tiene un proyecto registrado, cuando ingrese al sistema, entonces debe visualizar la información permitida, sin los datos privados de la empresa. |
| HU-19 | Dado que el cliente tiene credenciales válidas, cuando inicie sesión, entonces debe acceder únicamente a las funciones de su rol. |
| CC-02 | Los documentos se abren en un visor dentro del portal, sin botón de descarga. |
| HU-10 | Dado que existe un documento autorizado, cuando un usuario permitido consulte el proyecto, entonces debe poder visualizarlo. |

### Chat con preguntas frecuentes (Jorge)

| Historia | Criterio de aceptación |
| :--- | :--- |
| HU-13 | Dado que el cliente hace una pregunta frecuente, cuando exista una respuesta configurada, entonces debe mostrarse automáticamente; si no existe, la duda se envía a un responsable. |

## Preguntas probables del cliente

### Registro, solicitudes y chat (Jorge)

- **¿Cómo entran hoy los mensajes de WhatsApp?** El personal los registra en un solo formulario con el canal WhatsApp y quedan en Solicitudes junto con las del portal. Que entren solos es una propuesta: necesitamos su cuenta de WhatsApp Business.
- **¿Las respuestas automáticas usan inteligencia artificial?** No. Comparan la pregunta con las palabras clave que ustedes configuran: no cuesta y los datos no salen del portal. Si no hay respuesta, la duda le llega al arquitecto.

### Seguimiento y campana (Ximena)

- **¿Cuándo se enciende la campana?** Cuando hay una actualización, una respuesta del arquitecto, un cambio en la cotización o una solicitud asignada. Al abrir el aviso, se quita.

- **¿Cuándo tendríamos las fechas importantes?** En la Iteración 8, cuando se definan qué fechas se necesitan registrar y quién tendrá autorización para modificarlas.

### Aviso por correo (Jairo)

- **¿Qué dice el correo y a quién le llega?** A los clientes de la empresa del proyecto: tipo de actualización, descripción, fecha, responsable y un enlace al portal.
- **¿Llega aunque el cliente no entre al portal?** Sí. Es para dar seguimiento sin estar en la plataforma, como pidieron en CC-03.

### Asignación, actividad realizada e historial (Grecia)

- **¿El cliente ve todo lo que registra el arquitecto?** Ve avances, cambios de estado, documentos y actividades realizadas, con fecha y responsable. Las notas internas no.
- **¿Quién decide a quién se asigna una solicitud?** El personal, desde la bandeja. Quien la recibe se entera en su campana.

### Documentos y acceso (Romina)

- **¿El cliente puede descargar los documentos del proyecto?** No. Puede consultarlos directamente desde el portal, pero no descargarlos. Esto permite mantener los documentos dentro de la plataforma.

- **¿Qué pasa si el usuario escribe incorrectamente su contraseña?** El sistema muestra un mensaje indicando que el correo o la contraseña son incorrectos, sin especificar cuál de los dos datos falló.

## Retrospectiva

### ¿Qué funcionó bien?

Durante el desarrollo y la presentación del proyecto hubo una buena organización y colaboración entre los integrantes del equipo. La comunicación permitió trabajar de manera coordinada y cumplir con las actividades asignadas. Además, los cambios solicitados durante el desarrollo fueron atendidos y corregidos satisfactoriamente, lo que permitió mejorar el sistema y cumplir con los requerimientos establecidos.

### ¿Qué no funcionó o qué dificultades tuvimos?

Al inicio del proyecto, no teníamos completamente claro qué necesitaba el cliente ni cómo esperaba que funcionara el sistema. Esto hizo necesario revisar y aclarar algunos requerimientos durante el desarrollo. Sin embargo, conforme avanzó el proyecto, logramos comprender mejor sus necesidades y realizar los ajustes correspondientes.

### ¿Qué cambiaríamos si trabajáramos nuevamente con un cliente real?

Si volviéramos a desarrollar este proyecto, dedicaríamos más tiempo a tener reuniones privadas con el cliente, en un espacio donde pudiera expresar sus necesidades, dudas y expectativas con mayor tranquilidad, sin estar limitados por el tiempo o por tener que hablar frente a todo el equipo. Esto nos permitiría comprender mejor sus requerimientos desde el inicio, evitar confusiones y desarrollar una solución más cercana a lo que realmente necesita.
