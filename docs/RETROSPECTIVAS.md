# Retrospectivas

## Retrospectiva de la Iteración 4 (5 al 18 de octubre de 2026)

### 1. Datos de la reunión

- *Equipo:* Equipo 3
- *Grupo:* 711
- *Fecha:* 16 de octubre de 2026
- *Participantes:* Ximena Gutierrez Perez (responsable del producto), Jairo Miguel Alvarado Gonzalez (facilitador del trabajo), Jorge Estrada Estrada, Grecia Navarrete Mexicano y Romina Pavón Ibarra (equipo de desarrollo)
- *Facilitó:* Jairo Miguel Alvarado Gonzalez
- *Responsable de tomar notas:* Romina Pavón Ibarra

### 2. Objetivo de la iteración

- *Objetivo establecido:* En este ciclo (5 al 18 de octubre) el equipo construirá la base del módulo de Comunicación con el Cliente para registrar, clasificar y asignar a un responsable las solicitudes que llegan por todos los canales, conservar el historial de cada cliente y permitir que el cliente consulte de forma segura el avance de su proyecto.
- *Resultado del objetivo:* No cumplido, según la verificación de la responsable del producto en la presentación de avances.
- *Observaciones:* Ninguna de las cinco partes del objetivo (registro, clasificación, asignación, historial y consulta segura del cliente) llegó a Done. Sí hubo avance: 25 de las 26 tarjetas del ciclo están en In progress y RF-08 está en In review con la maqueta del inicio de sesión por roles. Las 12 historias de usuario pasan a la Iteración 5.

### 3. Resultados de la iteración

Datos tomados del tablero de GitHub Projects el día de la retrospectiva.

- *Historias de usuario completadas:* 0 de 12.
- *Horas completadas según el Burn up:* 0 de 116.

#### Estado de los issues

Números de la gráfica Status chart en Insights, con el filtro `is:issue -has:parent-issue`.

- *Backlog:* 0
- *In progress:* 13
- *In review:* 1
- *Done:* 3

### 4. ¿Qué funcionó bien?

Actividades, prácticas y formas de colaboración que ayudaron al equipo a avanzar durante la Iteración 4.

- Los roles quedaron definidos y publicados en el README el primer día del ciclo, mediante un Pull Request revisado por el facilitador (#31, 5 de octubre).
- El objetivo del ciclo se publicó en el status update del tablero el mismo día en que empezó la iteración.
- Se registraron seis riesgos en `docs/RIESGOS.md` y los dos más relevantes (R-01 y R-04) se convirtieron en issues con responsable antes de empezar.
- Todas las tarjetas del ciclo se asignaron y estimaron desde el arranque, con un reparto equilibrado de horas entre el equipo de desarrollo (36, 40 y 40 horas).
- Las gráficas Burn up y Status chart quedaron configuradas en Insights, y desde el 14 de octubre el facilitador deja evidencia de la revisión diaria del Burn up en el issue #30.
- Se logró una primera entrega visible: la maqueta del inicio de sesión por roles, que pasó a In review el 15 de octubre.

### 5. ¿Qué podemos mejorar?

Dificultades, retrasos y aspectos del proceso de trabajo que el equipo considera necesario mejorar.

- Ninguna historia de usuario llegó a Done antes de la retrospectiva, por lo que el Burn up se quedó en 0 de 116 horas completadas.
- Varias tarjetas pasaron nueve días en Backlog y empezaron hasta el 14 de octubre, a mitad del ciclo.
- Las historias de 16 horas (RF-01, RF-07, RF-08 y RNF-06) fueron demasiado grandes para terminarse dentro de un ciclo de dos semanas.
- La revisión diaria del Burn up empezó hasta la segunda semana, en lugar de hacerse desde el primer día.
- La maqueta del inicio de sesión se subió directo a `main`, sin rama ni Pull Request, y con contraseñas de prueba escritas en el código, en contra de `AGENTS.md` y de la definición de terminado.
- El repositorio todavía no tiene el proyecto configurado (`package.json` con `npm test`), así que la definición de terminado no se puede cumplir tal como está escrita.

### 6. Acuerdos de mejora

Cada acuerdo es concreto y tiene una persona responsable, una fecha límite y una forma de comprobar que se cumplió.

#### Acuerdo 1

- *Acción:* Partir cada historia de usuario de más de 8 horas en tareas de máximo 8 horas antes de empezar la Iteración 5.
- *Responsable:* Ximena Gutierrez Perez
- *Fecha límite:* 19 de octubre de 2026
- *Forma de verificación:* Ninguna tarjeta de la Iteración 5 tiene más de 8 en el campo Estimate.

#### Acuerdo 2

- *Acción:* Cada integrante mueve sus tarjetas en el tablero al terminar cada día de trabajo, y todos empiezan al menos una tarjeta el primer día del ciclo.
- *Responsable:* Jairo Miguel Alvarado Gonzalez
- *Fecha límite:* 21 de octubre de 2026
- *Forma de verificación:* El 21 de octubre nadie tiene todas sus tarjetas en Backlog, y el issue de seguimiento tiene una captura diaria del Burn up desde el 19 de octubre.

#### Acuerdo 3

- *Acción:* Todo cambio al repositorio se sube con una rama propia y un Pull Request aprobado por al menos un compañero; nadie sube cambios directo a `main`.
- *Responsable:* Jairo Miguel Alvarado Gonzalez
- *Fecha límite:* 26 de octubre de 2026
- *Forma de verificación:* En el historial de `main`, todos los cambios de la Iteración 5 llegan por merge de un Pull Request con aprobación.

#### Acuerdo 4

- *Acción:* Configurar el proyecto con `package.json` y el comando `npm test`, y quitar del código las contraseñas de prueba del inicio de sesión.
- *Responsable:* Romina Pavón Ibarra
- *Fecha límite:* 23 de octubre de 2026
- *Forma de verificación:* `npm test` se ejecuta sin errores en el repositorio y `login/script.js` ya no contiene contraseñas escritas.

### 7. Seguimiento de los acuerdos

El equipo dará seguimiento a los acuerdos para verificar su cumplimiento en las fechas definidas.

- *Fecha de seguimiento:* 26 de octubre de 2026, a la mitad de la Iteración 5.
- *Responsable del seguimiento:* Jairo Miguel Alvarado Gonzalez (facilitador del trabajo)
- *Observaciones:* El cumplimiento de cada acuerdo se revisará en la retrospectiva de la Iteración 5.
