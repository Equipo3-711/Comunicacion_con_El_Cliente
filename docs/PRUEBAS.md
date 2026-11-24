# Pruebas y calidad

Cómo se prueba la API del portal (`backend/`) y qué revisa GitHub Actions en cada pull request. La investigación está en el issue #94.

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

## Flujo de GitHub Actions

`.github/workflows/calidad.yml` se ejecuta en cada pull request y en cada cambio a `main`. Si un paso falla, la verificación **Calidad** aparece en rojo en el pull request.

| Trabajo | Paso | Falla cuando |
| :--- | :--- | :--- |
| Pruebas y análisis estático | Linter | ESLint encuentra un error, como una función con complejidad mayor a 10 |
| Pruebas y análisis estático | Pruebas con cobertura | Falla una prueba o la cobertura queda bajo el umbral |
| Dependencias y secretos | npm audit | Hay una dependencia con vulnerabilidad alta o crítica |
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

Pendiente: lo escribe Romina (T-21).

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
