# Ejemplos de uso

Recorridos paso a paso del prototipo del Portal de Proyectos, versión 0.1.0. Para instalar y comenzar a usar el proyecto, consulta el [README](../README.md).

Antes de empezar, abre `login/index.html` en el navegador. Los usuarios de prueba aparecen en la pantalla de inicio.

## Ejemplo 1: entrar como administrador

1. Escribe el correo y la contraseña del usuario de prueba **Admin**.
2. Da clic en **Iniciar sesión**.
3. Aparece «Bienvenido/a, Administrador | Rol: admin» y el aviso «Tienes acceso de administrador».
4. Además de la información del proyecto, se ve la sección **Información privada del administrador**.

## Ejemplo 2: entrar como cliente

1. Escribe el correo y la contraseña del usuario de prueba **Cliente**.
2. Da clic en **Iniciar sesión**.
3. Aparece «Bienvenido/a, Cliente de prueba | Rol: cliente» y el aviso «Solo puedes consultar información autorizada».
4. La sección privada del administrador no aparece (HU-08, criterio 2).

## Ejemplo 3: datos incorrectos

1. Escribe un correo o una contraseña que no existan.
2. Da clic en **Iniciar sesión**.
3. Aparece «Correo o contraseña incorrectos.», sin decir cuál de los dos datos falló (HU-19).

## Ejemplo 4: escribir en el chat

1. Da clic en el botón de chat.
2. Se abre la ventana de mensajes.
3. Escribe un mensaje y envíalo; aparece en la conversación.

En esta versión el chat todavía no responde. Las respuestas automáticas a preguntas frecuentes se incorporarán después.

## Ejemplo 5: cerrar sesión

1. Con la sesión iniciada, da clic en **Cerrar sesión**.
2. Regresa la pantalla de inicio con el formulario vacío.

## Ejemplo de contribución

Un pull request que solo agrega documentación:

- Título: `docs(ejemplos): agregar ejemplo de cierre de sesion`
- Etiqueta: `documentacion`
- Descripción: qué cambia, por qué y cómo se verificó.

Un pull request que rompe algo que ya funcionaba:

- Título: `feat(login)!: pedir correo y contraseña de la empresa`
- Etiquetas: `nueva-funcion` y `cambio-incompatible`
- Efecto: aparece en la categoría «Cambios incompatibles» de las notas y se anota en el CHANGELOG.
