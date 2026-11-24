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

Pendiente: lo escribe Grecia (T-21).

### Resultado del primer análisis

Pendiente: lo escribe Grecia (T-21).

### Cobertura

`npm run cobertura` ejecuta `jest --coverage`. Jest anota qué líneas, sentencias, funciones y ramas se ejecutaron durante las pruebas y muestra una tabla por archivo; el reporte completo queda en `backend/coverage/`, que no se sube a Git.

- `collectCoverageFrom: ["src/**/*.js"]` hace que cuenten todos los archivos de `src/`, también los que ninguna prueba abre.
- `coverageThreshold.global` en `backend/package.json` fija el mínimo. Si cualquiera de los cuatro números queda por debajo, Jest termina con error aunque todas las pruebas pasen, y el flujo queda en rojo.
- Medición antes de esta práctica: líneas 83 %, sentencias 82.38 %, funciones 71.34 % y ramas 62.69 %.

### Umbrales acordados

Pendiente: lo escribe Ximena (T-21).

## Pruebas de seguridad

### Validación de entradas

Todo lo que manda el usuario se valida en el servidor antes de llegar a un servicio, a una consulta o a un archivo. Si algo no cumple, la API responde 400 con el campo y el motivo.

- **Formularios:** cada ruta usa un validador de `src/validators/` con lista de lo permitido: valores válidos (por ejemplo, el tipo de trabajo), formato (correo, teléfono de 10 a 15 dígitos, fechas AAAA-MM-DD) y largo máximo.
- **Consultas:** los repositorios usan `?` en todas las consultas (`execute` de mysql2), así que el texto del usuario nunca se pega dentro del SQL.
- **Identificadores:** un `id` que no es un entero positivo se trata como inexistente (404).
- **Archivos:** multer solo acepta JPG, PNG, WEBP o PDF de hasta 10 MB y les pone un nombre aleatorio. Además, `verificarContenido` lee los primeros bytes de cada archivo y lo rechaza si no corresponden al tipo declarado; en ese caso borra lo recibido y responde 400.

**Pruebas del caso que debe fallar:**

| Prueba | Qué manda | Qué comprueba |
| :--- | :--- | :--- |
| `tests/archivos.test.js` | Un programa con nombre `contrato.pdf` | 400, el mensaje y que no se guardó nada |
| `tests/archivos.test.js` | Un texto que dice ser PNG | Que se borra del servidor |
| `tests/cotizaciones.test.js` | Campos vacíos o un `.exe` | 400 con el campo marcado |
| `tests/auth.test.js` | Correo o contraseña inválidos | 400 y mensaje genérico al iniciar sesión |

### Dependencias con vulnerabilidades

Pendiente: lo escribe Jairo (T-21).

### Llaves, contraseñas y secretos

Pendiente: lo escribe Jairo (T-21).
