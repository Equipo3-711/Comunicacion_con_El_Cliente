# Historias de Usuario - Módulo de Comunicación con el Cliente
**Módulo:** Comunicación con el cliente
**Equipo:** 3 (Grupo 711)

---

# Historia HU-01
**Requerimiento asociado:** RF-01
## Descripción
**Como:** Responsable de atención al cliente.
**Quiero:** Registrar solicitudes provenientes de diferentes medios de comunicación.
**Para:** Centralizar la información recibida desde WhatsApp, llamadas, redes sociales y página web.
## Criterios de aceptación
1. **Dado** que un cliente realiza una solicitud por cualquier canal disponible,  
**cuando** el responsable registre la información en el sistema,  
**entonces** la solicitud debe quedar almacenada con su origen identificado.
2. **Dado** que una solicitud fue registrada,  
**cuando** otro usuario autorizado consulte el cliente,  
**entonces** debe poder visualizar el historial de solicitudes.

---

# Historia HU-02
**Requerimiento asociado:** RF-02
## Descripción
**Como:** Responsable de atención.
**Quiero:** Registrar clientes asociados a proyectos.
**Para:** Tener organizada la información necesaria para brindar seguimiento personalizado.
## Criterios de aceptación
1. **Dado** que existe un nuevo cliente interesado,  
**cuando** el responsable capture sus datos,  
**entonces** el sistema debe crear un registro del cliente.
2. **Dado** que un cliente ya está registrado,  
**cuando** solicite información nuevamente,  
**entonces** el sistema debe permitir consultar sus datos.

---

# Historia HU-03
**Requerimiento asociado:** RF-03
## Descripción
**Como:** Cliente interesado.
**Quiero:** Solicitar una cotización de productos o servicios.
**Para:** Obtener una propuesta formal de acuerdo con mis necesidades.
## Criterios de aceptación
1. **Dado** que un cliente desea contratar un servicio,  
**cuando** registre su solicitud de cotización,  
**entonces** el sistema debe crear una solicitud asociada al cliente.
2. **Dado** que existe una solicitud de cotización,  
**cuando** el responsable la consulte,  
**entonces** debe visualizar la información proporcionada.

---

# Historia HU-04
**Requerimiento asociado:** RF-04
## Descripción
**Como:** Responsable de atención.
**Quiero:** Clasificar las solicitudes recibidas.
**Para:** Identificar rápidamente el tipo de atención que necesita cada cliente.
## Criterios de aceptación
1. **Dado** que se registra una nueva solicitud,  
**cuando** se complete el registro,  
**entonces** debe asignarse una categoría válida.
2. **Dado** que una solicitud no tiene categoría,  
**cuando** se intente guardar,  
**entonces** el sistema debe solicitar completar ese dato.

---

# Historia HU-05
**Requerimiento asociado:** RF-05
## Descripción
**Como:** Coordinador de proyectos.
**Quiero:** Asignar solicitudes a responsables.
**Para:** Garantizar que cada cliente tenga seguimiento.
## Criterios de aceptación
1. **Dado** que existe una solicitud pendiente,  
**cuando** el coordinador la asigne,  
**entonces** debe quedar registrado el responsable.
2. **Dado** que una solicitud tiene responsable asignado,  
**cuando** se consulte,  
**entonces** debe mostrarse quién está encargado.

---

# Historia HU-06
**Requerimiento asociado:** RF-06
## Descripción
**Como:** Responsable de atención.
**Quiero:** Consultar el historial de comunicación con un cliente.
**Para:** Conocer conversaciones anteriores y evitar pérdida de información.
## Criterios de aceptación
1. **Dado** que un cliente tiene comunicaciones registradas,  
**cuando** el responsable consulte su información,  
**entonces** debe visualizar mensajes, fechas y responsables.
2. **Dado** que se genera una nueva comunicación,  
**cuando** sea registrada,  
**entonces** debe agregarse al historial.

---

# Historia HU-07
**Requerimiento asociado:** RF-07
## Descripción
**Como:** Cliente propietario.
**Quiero:** Consultar avances de mi proyecto mediante fotografías y reportes.
**Para:** Conocer el progreso de mi obra sin depender únicamente de mensajes.
## Criterios de aceptación
1. **Dado** que existe un proyecto activo,  
**cuando** el cliente consulte el avance,  
**entonces** debe visualizar fotografías y reportes disponibles.
2. **Dado** que se genera una nueva actualización,  
**cuando** sea registrada,  
**entonces** debe estar disponible para consulta.

---

# Historia HU-08
**Requerimiento asociado:** RF-08
## Descripción
**Como:** Cliente propietario.
**Quiero:** Consultar información autorizada de mi proyecto.
**Para:** Conocer presupuesto, pagos, garantías y documentos relacionados.
## Criterios de aceptación
1. **Dado** que el cliente tiene un proyecto registrado,  
**cuando** ingrese al sistema,  
**entonces** debe visualizar la información permitida.
2. **Dado** que existe información privada de la empresa,  
**cuando** el cliente consulte su proyecto,  
**entonces** el sistema debe restringir datos no autorizados.
3. **Dado** que el cliente abre un documento autorizado, **cuando** lo consulte, **entonces** debe visualizarlo dentro del portal sin una opción para descargarlo.

---

# Historia HU-09
**Requerimiento asociado:** RF-09
## Descripción
**Como:** Coordinador de proyectos.
**Quiero:** Registrar fechas importantes del proyecto.
**Para:** Mantener organizado el calendario de seguimiento.
## Criterios de aceptación
1. **Dado** que existe una visita o junta programada,  
**cuando** se registre,  
**entonces** debe quedar asociada al proyecto correspondiente.
2. **Dado** que una fecha fue registrada,  
**cuando** sea consultada,  
**entonces** debe mostrar fecha y descripción.

---

# Historia HU-10
**Requerimiento asociado:** RF-10
## Descripción
**Como:** Responsable de proyecto.
**Quiero:** Adjuntar documentos relacionados con el servicio.
**Para:** Tener disponible información importante del proyecto.
## Criterios de aceptación
1. **Dado** que una solicitud requiere documentos,  
**cuando** el responsable los adjunte,  
**entonces** deben quedar almacenados.
2. **Dado** que existe un documento autorizado,  
**cuando** un usuario permitido consulte el proyecto,  
**entonces** debe poder visualizarlo.

---

# Historia HU-11
**Requerimiento asociado:** RF-11
## Descripción
**Como:** Responsable de atención.
**Quiero:** Actualizar una cotización cuando el cliente solicite cambios.
**Para:** Mantener la propuesta actualizada.
## Criterios de aceptación
1. **Dado** que un cliente solicita modificaciones,  
**cuando** el responsable actualice la cotización,  
**entonces** debe generarse una nueva versión.
2. **Dado** que existen varias versiones,  
**cuando** se consulte la cotización,  
**entonces** debe identificarse la versión vigente.

---

# Historia HU-12
**Requerimiento asociado:** RF-12
## Descripción
**Como:** Responsable de atención.
**Quiero:** Recibir notificaciones de nuevas solicitudes.
**Para:** Atender rápidamente las necesidades del cliente.
## Criterios de aceptación
1. **Dado** que se registra una solicitud nueva,  
**cuando** sea asignada,  
**entonces** el responsable debe recibir una notificación.
2. **Dado** que existe una notificación,  
**cuando** el usuario la abra,  
**entonces** debe mostrar la solicitud relacionada.

---

# Historia HU-13
**Requerimiento asociado:** RF-13
## Descripción
**Como:** Cliente.
**Quiero:** Obtener respuestas automáticas para dudas frecuentes.
**Para:** Resolver preguntas sencillas sin esperar atención personalizada.
## Criterios de aceptación
1. **Dado** que el cliente realiza una pregunta frecuente,  
**cuando** exista una respuesta configurada,  
**entonces** el sistema debe mostrar la información automáticamente.
2. **Dado** que la pregunta requiere atención especializada,  
**cuando** no exista respuesta automática,  
**entonces** debe enviarse a un responsable.

---

# Historia HU-14
**Requerimiento asociado:** RF-14
## Descripción
**Como:** Empresa.
**Quiero:** Medir la satisfacción del cliente después de la atención.
**Para:** Conocer la percepción del servicio recibido.
## Criterios de aceptación
1. **Dado** que una solicitud fue finalizada,  
**cuando** termine el proceso de atención,  
**entonces** el sistema debe permitir enviar una encuesta.
2. **Dado** que un cliente responde la encuesta,  
**cuando** se registre la respuesta,  
**entonces** debe almacenarse asociada al servicio.

---

# Historia HU-15
**Requerimiento asociado:** RF-15
## Descripción
**Como:** Director de proyectos.
**Quiero:** Generar reportes de atención al cliente.
**Para:** Analizar tiempos de respuesta y seguimiento realizado.
## Criterios de aceptación
1. **Dado** que existen solicitudes registradas,  
**cuando** el director genere un reporte,  
**entonces** debe incluir solicitudes, responsables y estados.
2. **Dado** que un reporte fue generado,  
**cuando** el usuario lo descargue,  
**entonces** debe obtener un archivo con la información solicitada.

---

# Historia HU-16
**Requerimiento asociado:** RNF-01
## Descripción
**Como:** Responsable de atención.
**Quiero:** Registrar una solicitud de cliente en pocos pasos.
**Para:** Capturar la información rápidamente mientras atiendo al cliente.
## Criterios de aceptación
1. **Dado** que llega una nueva solicitud,  
**cuando** el responsable la registre,  
**entonces** el flujo no debe exceder 5 pasos ni 60 segundos.
2. **Dado** que falta un dato obligatorio,  
**cuando** se intente guardar,  
**entonces** el sistema debe señalar el campo faltante sin reiniciar el registro.

---

# Historia HU-17
**Requerimiento asociado:** RNF-02
## Descripción
**Como:** Responsable de atención.
**Quiero:** Que la información de un cliente o proyecto se muestre de inmediato.
**Para:** Responder al cliente durante la llamada sin hacerlo esperar.
## Criterios de aceptación
1. **Dado** que existe una conexión estable,  
**cuando** el responsable abra el detalle de un cliente,  
**entonces** la información debe mostrarse en un máximo de 3 segundos.
2. **Dado** que un proyecto tiene fotografías,  
**cuando** se abra,  
**entonces** la información principal debe aparecer en un máximo de 3 segundos aunque las imágenes sigan cargando.

---

# Historia HU-18
**Requerimiento asociado:** RNF-03
## Descripción
**Como:** Coordinador de proyectos.
**Quiero:** Consultar las solicitudes sin demoras aunque haya varios usuarios conectados.
**Para:** Dar seguimiento en los horarios de mayor actividad.
## Criterios de aceptación
1. **Dado** que hay hasta 50 usuarios concurrentes,  
**cuando** se consulte la lista de solicitudes,  
**entonces** el 95% de las consultas debe responder en un máximo de 2 segundos.
2. **Dado** que se aplica un filtro por categoría o responsable,  
**cuando** se ejecute la consulta,  
**entonces** el resultado debe respetar el mismo límite de tiempo.

---

# Historia HU-19
**Requerimiento asociado:** RNF-06
## Descripción
**Como:** Cliente propietario.
**Quiero:** Ingresar con usuario y contraseña y ver solo la información que me corresponde.
**Para:** Tener la certeza de que los datos de mi proyecto están protegidos.
## Criterios de aceptación
1. **Dado** que el cliente tiene credenciales válidas,  
**cuando** inicie sesión,  
**entonces** debe acceder únicamente a las funciones de su rol.
2. **Dado** que se ingresan credenciales inválidas,  
**cuando** se intente acceder,  
**entonces** el sistema debe negar el acceso sin indicar cuál dato fue incorrecto.

---

# Historia HU-20
**Requerimiento asociado:** RF-16

## Descripción
**Como:** Cliente.  
**Quiero:** Ver las actualizaciones de mi proyecto en un formato claro.  
**Para:** Conocer cómo va sin tener que iniciar una conversación.

## Criterios de aceptación
1. **Dado** que el proyecto tiene actualizaciones,  
   **cuando** el cliente lo consulte,  
   **entonces** debe ver el tipo, la descripción, la fecha y el responsable de cada una.

2. **Dado** que el cliente tiene una duda,  
   **cuando** la actualización no la resuelva,  
   **entonces** debe poder abrir el chat para preguntar.

---

# Historia HU-21
**Requerimiento asociado:** RF-17

## Descripción
**Como:** Arquitecto.  
**Quiero:** Marcar una actividad como realizada.  
**Para:** Que el cliente la vea de inmediato sin escribirle un mensaje.

## Criterios de aceptación
1. **Dado** que terminó una actividad,  
   **cuando** el arquitecto la marque como realizada,  
   **entonces** debe aparecer en el proyecto del cliente con fecha y responsable.

2. **Dado** que se publicó una actividad,  
   **cuando** el cliente consulte el proyecto,  
   **entonces** debe verla sin que exista una conversación.

---

# Historia HU-22
**Requerimiento asociado:** RF-18

## Descripción
**Como:** Usuario del portal.  
**Quiero:** Ver una campana cuando tenga algo pendiente.  
**Para:** Atender actualizaciones, dudas o solicitudes sin revisar todo el proyecto.

## Criterios de aceptación
1. **Dado** que existe algo pendiente,  
   **cuando** el usuario entre al portal,  
   **entonces** la campana debe mostrar cuántos pendientes tiene.

2. **Dado** que el usuario abre un pendiente,  
   **cuando** lo revise,  
   **entonces** el contador debe disminuir y mostrar el elemento relacionado.

---

# Historia HU-23
**Requerimiento asociado:** RF-19

## Descripción
**Como:** Cliente.  
**Quiero:** Recibir por correo las actualizaciones de mi proyecto.  
**Para:** Dar seguimiento sin tener que entrar a la plataforma.

## Criterios de aceptación
1. **Dado** que se publica una actualización,  
   **cuando** se guarde,  
   **entonces** el cliente debe recibir un correo con el resumen y un enlace a su proyecto.

2. **Dado** que el cliente abre el enlace,  
   **cuando** no tenga sesión iniciada,  
   **entonces** el sistema debe pedirle que inicie sesión antes de mostrar el proyecto.
