# Pruebas y calidad

Cómo se prueban la API del portal (`backend/`) y la aplicación web (`frontend/`), y qué revisa GitHub Actions en cada pull request. La investigación está en el issue #94.

## Cómo ejecutar las pruebas

Todo se ejecuta dentro de `backend/` y no necesita MySQL: las pruebas reemplazan la base de datos por simulaciones.

```bash
cd backend
npm install
npm test                       # todas las pruebas
npm run cobertura              # pruebas con reporte de cobertura y umbral
npm run lint                   # análisis estático con ESLint
npm audit --audit-level=high   # dependencias con vulnerabilidades
```

### Cómo está hecha una prueba

- Jest busca los archivos `tests/*.test.js` y ejecuta cada `test(...)`.
- `tests/setup.js` pone valores que solo sirven para las pruebas, como la llave de los tokens.
- `jest.mock(...)` reemplaza los repositorios por funciones falsas. Así la prueba decide qué «devuelve la base de datos» y revisa qué se le pidió guardar.
- Supertest hace peticiones HTTP a la app sin levantar el servidor.
- `expect(...)` compara el resultado con lo esperado. Si no coincide, la prueba falla.

## Pruebas de la aplicación web

Se ejecutan dentro de `frontend/`. Ninguna necesita la API ni MySQL: las respuestas de la API se simulan.

```bash
cd frontend
npm install
npm test        # pruebas unitarias con Vitest y Testing Library
npm run lint    # análisis estático con ESLint (complejidad máxima 10, como la API)
npm run tipos   # revisión de tipos de TypeScript
npm run dev     # en otra terminal, antes de Cypress
npm run e2e     # flujos completos con Cypress
```

- **Vitest** prueba piezas sueltas: formatos de fecha y dinero, a dónde lleva cada pendiente, la conexión con la API (token, errores por campo y sesión expirada) y pantallas completas como iniciar sesión, la bandeja de solicitudes y modificar una cotización. Los archivos son `src/**/*.test.ts(x)`.
- **Cypress** abre la aplicación en un navegador y recorre los flujos como lo haría una persona: iniciar sesión, la campana, registrar y atender solicitudes, abrir un proyecto desde una cotización, el visor de documentos y modificar una cotización. Las respuestas de la API salen de `cypress/fixtures/datos.json`.
- `cypress/e2e/responsivo.cy.ts` abre cada pantalla en celular chico (360 px), celular (390 px), tableta (768 px) y computadora (1280 px), y falla si alguna se sale de la pantalla a los lados o si una parte del encabezado queda fuera.

## Flujo de GitHub Actions

`.github/workflows/calidad.yml` se ejecuta en cada pull request y en cada cambio a `main`. Si un paso falla, la verificación **Calidad** aparece en rojo en el pull request.

| Trabajo | Paso | Falla cuando |
| :--- | :--- | :--- |
| Pruebas y análisis estático | Linter | ESLint encuentra un error, como una función con complejidad mayor a 10 |
| Pruebas y análisis estático | Pruebas con cobertura | Falla una prueba o la cobertura queda bajo el umbral |
| Aplicación web | Linter y tipos | ESLint o TypeScript encuentran un error |
| Aplicación web | Pruebas unitarias y build | Falla una prueba de Vitest o la aplicación no compila |
| Aplicación web | Flujos completos con Cypress | Falla un flujo o una pantalla no se ve completa en celular, tableta o computadora |
| Dependencias y secretos | npm audit | Hay una dependencia con vulnerabilidad alta o crítica, en la API o en la aplicación web |
| Dependencias y secretos | Gitleaks | Aparece una llave o contraseña en el código o en el historial |

El repositorio es privado y del plan gratuito, así que GitHub no permite hacer obligatoria la verificación. El acuerdo del equipo es no integrar un pull request con el flujo en rojo.

## Análisis estático

### Linter y regla de complejidad

Usamos **ESLint 9**, configurado en `backend/eslint.config.js`, y se ejecuta con `npm run lint`.

- `js.configs.recommended` activa las reglas recomendadas de ESLint, como `no-unused-vars`, `no-undef`, `no-unreachable` y `no-dupe-keys`.
- `complexity: ["error", 10]` limita la complejidad ciclomática de cada función a 10. Cada `if`, `case`, ciclo, `&&`, `||`, `??` y `?:` suma un camino. ESLint no la activa por defecto, y su máximo por defecto es 20.
- `no-unused-vars` con `ignoreRestSiblings` permite descartar un campo con `const { campo, ...resto } = objeto`. Así ocultamos las notas internas al cliente.

En el flujo, el paso **Linter** va antes de las pruebas. Si ESLint encuentra un error, el flujo queda en rojo.

### Resultado del primer análisis

Primer análisis, el 24 de noviembre de 2026, sobre el código de `main` sin corregir nada: **1 hallazgo** (1 error, 0 advertencias).

| Regla | Archivo | Qué encontró | Cómo se resolvió |
| :--- | :--- | :--- | :--- |
| `no-unused-vars` | `src/services/proyectos.service.js:23` | `notasInternas` se declara y no se usa | Se descarta a propósito para ocultarla al cliente; se activó `ignoreRestSiblings` |

Ninguna función superó la complejidad de 10.

**Prueba del umbral.** En el PR #105 se agregó `formatearFecha` con un `switch` de 12 casos (complejidad 13), y el flujo quedó en rojo. En el mismo PR se cambió por una lista de meses (complejidad 4), y el flujo quedó en verde antes de integrar.

### Cobertura

`npm run cobertura` ejecuta `jest --coverage`. Jest anota qué líneas, sentencias, funciones y ramas se ejecutaron durante las pruebas y muestra una tabla por archivo; el reporte completo queda en `backend/coverage/`, que no se sube a Git.

- `collectCoverageFrom: ["src/**/*.js"]` hace que cuenten todos los archivos de `src/`, también los que ninguna prueba abre.
- `coverageThreshold.global` en `backend/package.json` fija el mínimo. Si cualquiera de los cuatro números queda por debajo, Jest termina con error aunque todas las pruebas pasen, y el flujo queda en rojo.
- Medición antes de esta práctica: líneas 83 %, sentencias 82.38 %, funciones 71.34 % y ramas 62.69 %.

### Umbrales acordados

Acordados en el issue #94. Se fijaron un poco por debajo de la medición inicial, para que el código actual pase y cualquier cambio que empeore la calidad ponga el flujo en rojo.

| Umbral | Valor | Dónde se configura | Motivo |
|---|---|---|---|
| Complejidad por función | 10 | `backend/eslint.config.js` | Ninguna función actual la pasa; el valor por defecto de ESLint (20) es muy alto para un proyecto chico. |
| Cobertura de líneas | 80 % | `backend/package.json` | Medición inicial: 83 %. |
| Cobertura de sentencias | 80 % | `backend/package.json` | Medición inicial: 82.38 %. |
| Cobertura de funciones | 70 % | `backend/package.json` | Medición inicial: 71.34 %; la bajan los repositorios, que se simulan. |
| Cobertura de ramas | 60 % | `backend/package.json` | Medición inicial: 62.69 %. |
| Vulnerabilidades | 0 altas o críticas | `.github/workflows/calidad.yml` | Las moderadas solo están en herramientas de desarrollo. |

**Cuándo se suben.** Cuando la cobertura real supere un umbral por 5 puntos, se sube ese umbral en un PR propio. Nunca se bajan para que un PR pase.
## Pruebas de seguridad

### Validación de entradas

Todo lo que manda el usuario se valida en el servidor antes de llegar a un servicio, a una consulta o a un archivo. Si algo no cumple, la API responde 400 con el campo y el motivo.

- **Formularios:** cada ruta usa un validador de `src/validators/` con lista de lo permitido: valores válidos (por ejemplo, el tipo de trabajo), formato (correo, teléfono de 10 a 15 dígitos, fechas AAAA-MM-DD) y largo máximo.
- **Consultas:** los repositorios usan `?` en todas las consultas (`execute` de mysql2), así que el texto del usuario nunca se pega dentro del SQL.
- **Identificadores:** un `id` que no es un entero positivo se trata como inexistente (404).
- **Archivos:** multer solo acepta JPG, PNG, WEBP o PDF de hasta 10 MB y les pone un nombre aleatorio. Además, `verificarContenido` lee los primeros bytes de cada archivo y lo rechaza si no corresponden al tipo declarado; en ese caso borra lo recibido y responde 400. Se aplica a los documentos del proyecto, a los archivos de la cotización y a las fotos de los avances.

**Pruebas del caso que debe fallar:**

| Prueba | Qué manda | Qué comprueba |
| :--- | :--- | :--- |
| `tests/archivos.test.js` | Un programa con nombre `contrato.pdf` | 400, el mensaje y que no se guardó nada |
| `tests/archivos.test.js` | Un texto que dice ser PNG | Que se borra del servidor |
| `tests/fotos.test.js` | Una foto de avance que dice ser PNG y no lo es | 400, que no se registra la actualización y que no se guarda el archivo |
| `tests/cotizaciones.test.js` | Campos vacíos o un `.exe` | 400 con el campo marcado |
| `tests/auth.test.js` | Correo o contraseña inválidos | 400 y mensaje genérico al iniciar sesión |

### Dependencias con vulnerabilidades

El trabajo **Seguridad** del flujo ejecuta `npm audit --audit-level=high` dentro de `backend/`. `npm audit` compara las versiones del `package-lock.json` con la base de avisos de seguridad de npm. Si encuentra una vulnerabilidad alta o crítica, termina con error y el flujo queda en rojo.

Además están activadas las alertas de Dependabot del repositorio, que avisan aunque nadie abra un PR.

- **Resultado al activarlo:** 0 vulnerabilidades altas o críticas. Hay avisos moderados en herramientas de desarrollo (Jest y nodemon), que no llegan al servidor.
- **Si el flujo marca una:** se actualiza la dependencia con `npm update` o `npm audit fix`. No se usa `npm audit fix --force` sin revisar qué cambia, porque puede instalar versiones incompatibles.
- **Por qué no usamos la revisión de dependencias de GitHub:** en un repositorio privado del plan gratuito necesita GitHub Advanced Security.

### Llaves, contraseñas y secretos

**Dónde se guardan.** Los valores reales van en `backend/.env`, que `.gitignore` excluye. `backend/.env.example` solo trae los nombres de las variables. Si un día el flujo necesita un secreto, se guarda en *Settings › Secrets and variables › Actions* y se lee con `${{ secrets.NOMBRE }}`; GitHub lo oculta en los registros.

**Cómo se detectan.** El trabajo **Seguridad** descarga Gitleaks y ejecuta `gitleaks git` sobre todo el historial (el checkout usa `fetch-depth: 0`). Si encuentra una llave o contraseña, el flujo queda en rojo. Primera revisión: 95 commits, 0 hallazgos.

**La API no muestra secretos.** Si falta una variable obligatoria, el servidor solo dice su nombre. Lo comprueba `tests/config.test.js`.

**Si aparece un secreto:**
1. Se cambia de inmediato en el servicio al que pertenece. Borrarlo del código no basta, porque sigue en el historial y en cada copia del repositorio.
2. El valor nuevo se guarda solo en `.env` o en los secretos de GitHub.
3. Se quita del código en un PR y se avisa al equipo en el issue.
