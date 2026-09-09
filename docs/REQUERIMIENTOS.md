# Requerimientos - Módulo de Comunicación con el Cliente

**Módulo:** Comunicación con el cliente
**Equipo:** 3 (Grupo 711)

### Requerimientos Funcionales (RF)
*Objetivo:* Al menos 15 requerimientos funcionales clasificados, priorizados y verificables.

| ID | Tipo | Requerimiento | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-01 | Func. | El sistema debe requerir y registrar la autorización del cliente propietario antes de procesar solicitudes que modifiquen el alcance, costo o fecha de entrega de la obra. | Alta |
| RF-02 | Func. | El sistema debe clasificar obligatoriamente cada interacción entrante bajo uno de los tipos definidos: duda, cambio de alcance, queja, aprobación o informativo. | Media |
| RF-03 | Func. | El módulo debe bloquear la visibilidad de información interna, asegurando que el cliente propietario no tenga acceso a los precios de contratistas, márgenes ni conversaciones internas. | Alta |
| RF-04 | Func. | El sistema debe permitir asignar a cada solicitud un responsable de atención y registrar una fecha compromiso de respuesta para dar seguimiento a su cumplimiento. | Alta |
| RF-05 | Func. | El sistema debe conservar el historial de solicitudes de cada obra, incluyendo su estado, responsable, fechas, decisiones y evidencias asociadas, para permitir su seguimiento posterior. | Alta |

RF-06 | Func. | El sistema debe calcular y mostrar el tiempo límite de respuesta para cada solicitud con base en su tipo y prioridad, medido exclusivamente en horas hábiles. | Alta |
RF-07 | Func. | El sistema debe restringir el cierre de una solicitud exclusivamente al usuario asignado como responsable, exigiendo de forma obligatoria el registro de la decisión final tomada. | Alta |
RF-08 | Func. | El sistema debe proveer un tablero de control (dashboard) para la dirección que consolide y muestre el número de solicitudes abiertas, las vencidas y el tiempo promedio real de respuesta por cada obra. | Alta |
<br>

### Requerimientos No Funcionales (RNF)
*Objetivo:* Al menos 8 requerimientos no funcionales.

| ID | Tipo | Requerimiento | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-01 | Usabilidad | La interfaz móvil debe permitir al residente de obra registrar una petición en campo utilizando una sola mano libre. | Alta |
| RNF-02 | Eficiencia | La bitácora de avance debe actualizar y mostrar al cliente las evidencias fotográficas de su proyecto en un tiempo máximo de **3 segundos** al acceder con conexión estable.| Media |
| RNF-03 | Rendimiento | El sistema deberá mostrar el estado y la información de una solicitud en un tiempo máximo de 2 segundos en el 95 % de las consultas, con hasta 50 usuarios concurrentes. | Alta |

| RNF-04 | Disponibilidad | La aplicación móvil utilizada en obra debe permitir la captura de evidencias y solicitudes en modo fuera de línea (offline) para zonas sin cobertura (ej. sótanos) y sincronizarlas al recuperar la conexión. | Alta |
| RNF-05 | Accesibilidad | El portal o bitácora de consulta para el cliente propietario debe ser accesible a través de navegadores web móviles sin requerir la descarga o instalación de una aplicación nativa. | Alta |

