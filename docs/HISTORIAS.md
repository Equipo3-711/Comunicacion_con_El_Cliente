# Historias de Usuario - Módulo de Comunicación con el Cliente

**Historia:** HU-01
**Requerimiento asociado:** RF-01
**Descripción:** 
* **Rol:** Como arquitecto director.
* **Necesidad:** Quiero registrar la autorización del cliente frente a cualquier solicitud de cambio de alcance.
* **Beneficio:** Para evitar que los cambios se ejecuten en obra antes de estar aprobados y prevenir discusiones posteriores sobre el costo.

**Criterios de Aceptación:**
1. **Dado** que un residente de obra registra un cambio solicitado verbalmente por el cliente en el sitio, **cuando** el cambio implica una modificación en el costo o la fecha, **entonces** el sistema bloquea la orden de ejecución hasta que se adjunte una evidencia verificable de la autorización del cliente propietario.
2. **Dado** que una solicitud de cambio requiere aprobación, **cuando** el arquitecto director sube la evidencia de autorización, **entonces** el sistema cambia el estado a "Autorizado" y el responsable asignado puede proceder a su cierre.

---

**Historia:** HU-02
**Requerimiento asociado:** RF-03
**Descripción:** 
* **Rol:** Como cliente propietario.
* **Necesidad:** Quiero consultar el estado de mis solicitudes y la bitácora de avance de mi obra.
* **Beneficio:** Para tener certeza del proyecto sin necesidad de perseguir al personal de la empresa o preguntar por mensajería.

**Criterios de Aceptación:**
1. **Dado** que accedo a la plataforma para ver el estatus de mi obra, **cuando** visualizo el detalle de una solicitud de cambio que incluye estimaciones de costo, **entonces** el sistema muestra únicamente mi impacto financiero final, ocultando por completo los precios de los contratistas y los márgenes de la empresa.
2. **Dado** que tengo dudas sobre el progreso de mi proyecto, **cuando** accedo a la sección de avance, **entonces** visualizo un reporte con las fotografías de la obra sin acceder a los comentarios internos ni a las conversaciones del equipo de diseño.

---

**Historia:** HU-03
**Requerimiento asociado:** RF-02

* **Rol:** Como integrante encargado de atender al cliente.
* **Necesidad:** Quiero clasificar cada interacción recibida según el motivo de contacto.
* **Beneficio:** Para identificar correctamente qué tipo de atención requiere y evitar que solicitudes importantes se confundan con dudas o mensajes informativos.

**Criterios de aceptación:**

1. **Dado** que se registra una nueva interacción del cliente, **cuando** se complete su registro, **entonces** deberá estar clasificada como duda, cambio de alcance, queja, aprobación o informativo.
2. **Dado** que una interacción no tiene un tipo asignado, **cuando** se intente completar su registro, **entonces** no deberá considerarse correctamente registrada.
3. **Dado** que una interacción ya fue clasificada, **cuando** sea consultada posteriormente, **entonces** deberá conservar el tipo que le fue asignado.

---

**Historia:** HU-04
**Requerimiento asociado:** RF-04

* **Rol:** Como coordinador de proyectos.
* **Necesidad:** Quiero que las solicitudes de los clientes tengan un responsable y una fecha compromiso.
* **Beneficio:** Para saber quién debe atender cada petición y evitar solicitudes sin seguimiento.

**Criterios de aceptación:**

1. **Dado** que existe una solicitud pendiente, **cuando** se asigne su atención, **entonces** deberá quedar registrado el responsable correspondiente.
2. **Dado** que una solicitud tiene un responsable, **cuando** se establezca un compromiso de atención, **entonces** deberá quedar registrada una fecha compromiso.
3. **Dado** que se cambia al responsable de una solicitud, **cuando** se confirme el cambio, **entonces** deberá conservarse registro del responsable anterior y del nuevo responsable.

---

**Historia:** HU-05
**Requerimiento asociado:** RF-07
* **Rol:** Como residente de obra (responsable asignado).  
* **Necesidad:** Quiero ser el único que pueda cerrar las solicitudes que me han sido asignadas, registrando la decisión tomada.  
* **Beneficio:** Para asegurar que nadie más cierre una queja o petición sin mi conocimiento y mantener la trazabilidad de la solución.  
* **Criterios de aceptación:** 
1. * **Dado** que un usuario distinto al responsable asignado visualiza una solicitud, cuando intenta hacer clic en el botón de "Cerrar solicitud", entonces el sistema bloquea la acción y muestra un mensaje indicando que no tiene los permisos.  
2. * **Dado** que el responsable asignado está resolviendo una solicitud, cuando intenta cambiar el estado a "Cerrado" sin escribir en el campo de "Decisión final", entonces el sistema le impide avanzar y marca el campo como obligatorio. 

---

Historia: HU-06

**Requerimiento asociado:** RF-05

**Descripción:**

* **Rol:** Como coordinador de proyectos.
* **Necesidad:** Quiero consultar el historial completo de las solicitudes de una obra.
* **Beneficio:** Para conocer el seguimiento que ha tenido cada solicitud y mantener evidencia de las acciones realizadas durante la atención al cliente.

* **Criterios de aceptación:**

1. * **Dado** que una obra tiene solicitudes registradas, **cuando** el coordinador consulte su historial, **entonces** el sistema deberá mostrar las solicitudes junto con su estado, responsable y fechas correspondientes.
2. * **Dado** que una solicitud cuenta con decisiones y evidencias asociadas, **cuando** se consulte su historial, **entonces** el sistema deberá mostrar las decisiones y evidencias relacionadas con dicha solicitud.
3. * **Dado** que una solicitud ha cambiado de responsable o estado, **cuando** se consulte posteriormente, **entonces** el sistema deberá conservar y mostrar el registro de dichos cambios.


