# Requerimientos - Módulo de Comunicación con el Cliente

**Módulo:** Comunicación con el cliente

**Equipo:** 3 (Grupo 711)

## Requerimientos Funcionales (RF)

**Objetivo:** Definir las funcionalidades necesarias para centralizar, organizar y mejorar la comunicación entre la empresa y sus clientes.

| ID | Tipo | Requerimiento | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-01 | Funcional | El sistema debe permitir registrar y centralizar las solicitudes recibidas desde diferentes canales de comunicación como WhatsApp, llamadas, redes sociales y página web. | Alta |
| RF-02 | Funcional | El sistema debe permitir registrar nuevos clientes asociados a un proyecto, incluyendo datos de contacto e información básica del servicio solicitado. | Alta |
| RF-03 | Funcional | El sistema debe permitir registrar solicitudes de cotización relacionadas con productos o servicios solicitados por el cliente. | Alta |
| RF-04 | Funcional | El sistema debe permitir clasificar las solicitudes recibidas en categorías como cotización, duda, modificación, queja, seguimiento o información general. | Alta |
| RF-05 | Funcional | El sistema debe permitir asignar cada solicitud a un responsable de atención para garantizar su seguimiento. | Alta |
| RF-06 | Funcional | El sistema debe registrar por cada proyecto el historial de lo que ha sucedido: actualizaciones, cambios de estado, solicitudes, documentos y mensajes, con fechas y responsables. | Alta |
| RF-07 | Funcional | El sistema debe permitir consultar el avance del proyecto mediante fotografías, reportes y actualizaciones registradas por el personal encargado. | Alta |
| RF-08 | Funcional | El sistema debe permitir al cliente consultar información relacionada con su proyecto, incluyendo avances, fotografías, presupuesto, pagos, garantías y documentos autorizados. | Alta |
| RF-09 | Funcional | El sistema debe permitir registrar fechas importantes del proyecto como visitas, juntas programadas y fechas compromiso. | Media |
| RF-10 | Funcional | El sistema debe permitir adjuntar documentos relacionados con el proyecto como cotizaciones, fichas técnicas, certificaciones y términos y condiciones. | Media |
| RF-11 | Funcional | El sistema debe permitir modificar y actualizar una cotización cuando el cliente solicite cambios en productos o servicios. | Alta |
| RF-12 | Funcional | El sistema debe generar notificaciones al responsable cuando se registre una nueva solicitud de cliente. | Alta |
| RF-13 | Funcional | El sistema debe permitir generar respuestas automáticas para preguntas frecuentes previamente configuradas. | Media |
| RF-14 | Funcional | El sistema debe permitir medir la satisfacción del cliente mediante una encuesta después de finalizar una solicitud o servicio. | Media |
| RF-15 | Funcional | El sistema debe permitir generar reportes sobre solicitudes atendidas, tiempos de respuesta y seguimiento de clientes. | Media |
| RF-16 | Funcional | El sistema debe registrar el seguimiento de cada proyecto mediante actualizaciones estructuradas con tipo, descripción, fecha y responsable, sin requerir una conversación. | Alta |
| RF-17 | Funcional | El sistema debe permitir al arquitecto marcar una actividad como realizada y publicarla de inmediato para el cliente, sin iniciar una conversación. | Alta |
| RF-18 | Funcional | El sistema debe mostrar a cada usuario una campana con el número de actualizaciones, dudas y solicitudes pendientes. | Alta |
| RF-19 | Funcional | El sistema debe enviar al cliente un aviso por correo electrónico cuando se publique una actualización de su proyecto, con un resumen y un enlace. | Media |

## Requerimientos No Funcionales (RNF)

**Objetivo:** Definir características de calidad, seguridad y desempeño del módulo.

| ID | Tipo | Requerimiento | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-01 | Usabilidad | El sistema debe permitir registrar una solicitud de cliente en un máximo de 5 pasos y en un tiempo menor a 60 segundos para facilitar la captura por parte del personal. | Alta |
| RNF-02 | Desempeño | El sistema debe mostrar la información de un cliente o proyecto en un tiempo máximo de 3 segundos con una conexión estable. | Alta |
| RNF-03 | Rendimiento | El sistema debe permitir consultar solicitudes en un tiempo máximo de 2 segundos en el 95% de las consultas con hasta 50 usuarios concurrentes. | Alta |
| RNF-04 | Disponibilidad | El sistema debe mantener disponibles las funciones principales del módulo al menos el 99% del tiempo mensual. | Alta |
| RNF-05 | Compatibilidad | El sistema debe funcionar correctamente en dispositivos Android versión 10 o superior, iOS versión 15 o superior y navegadores Chrome, Edge y Safari en sus 3 versiones más recientes. | Media |
| RNF-06 | Seguridad | El sistema debe proteger la información del cliente mediante autenticación por usuario y contraseña, permitiendo acceso únicamente según el rol asignado. | Alta |
| RNF-07 | Respaldo | El sistema debe realizar respaldos automáticos de la información registrada al menos una vez al día. | Alta |
| RNF-08 | Comunicación | El sistema debe registrar las respuestas y comunicaciones realizadas con clientes conservando un historial mínimo de 12 meses. | Media |
