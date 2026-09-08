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
| RF-03 | Func. | El módulo debe bloquear la visibilidad de información interna, asegurando que el cliente propietario no tenga acceso a los precios de contratistas, márgenes ni conversaciones internas. | Alta |
| RF-04 | Func. | El sistema debe permitir asignar a cada solicitud un responsable de atención y registrar una fecha compromiso de respuesta para dar seguimiento a su cumplimiento. | Alta |
| RF-05 | Func. | El sistema debe conservar el historial de solicitudes de cada obra, incluyendo su estado, responsable, fechas, decisiones y evidencias asociadas, para permitir su seguimiento posterior. | Alta |

<br>

### Requerimientos No Funcionales (RNF)
*Objetivo:* Al menos 8 requerimientos no funcionales.

| ID | Tipo | Requerimiento | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-01 | Usabilidad | La interfaz móvil debe permitir al residente de obra registrar una petición en campo utilizando una sola mano libre. | Alta |
| RNF-02 | Eficiencia | La bitácora de avance debe actualizar y mostrar al cliente las evidencias fotográficas de su proyecto en un tiempo máximo de **3 segundos** al acceder con conexión estable.| Media |
| RNF-03 | Rendimiento | El sistema deberá mostrar el estado y la información de una solicitud en un tiempo máximo de 2 segundos en el 95 % de las consultas, con hasta 50 usuarios concurrentes. | Alta |
