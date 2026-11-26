# Despliegue de prueba en Vercel

Esta guía publica el portal en internet para que el equipo lo revise desde cualquier computadora o celular. Es un despliegue **de prueba**: sirve para revisar pantallas y flujos, no para clientes reales.

En local nada cambia: Docker con MySQL, `npm run dev` en `backend/` y en `frontend/`, como dice el [README](../README.md).

## Cómo queda

| Parte | Dónde corre | Qué cambia respecto a local |
| :--- | :--- | :--- |
| Aplicación web (`frontend/`) | Proyecto de Vercel con Vite | Le dice a la web dónde está la API con `VITE_API_URL`. |
| API (`backend/`) | Proyecto de Vercel, como una función (`backend/api/index.js`) | Es la misma app de `src/app.js`, sin abrir puerto. |
| Base de datos | MySQL 8 en la nube, por ejemplo [Aiven](https://aiven.io/mysql) (tiene plan gratuito) | Conexión cifrada (`DB_SSL`) y hora de México (`DB_TIMEZONE`). |
| Fotos y documentos | Vercel Blob, como archivos **privados** | Solo la API los lee y los entrega con sesión, igual que en local. |
| Correos de aviso | El SMTP que se configure (opcional) | Ninguno. |

Vercel no edita código: cada vez que se publica, sube una versión nueva desde la computadora. Los datos de la nube y los de local son bases distintas.

## Límites del despliegue de prueba

- Vercel acepta hasta **4.5 MB por petición**. Una foto o un PDF más grande falla en la nube aunque en local sí suba (allá el límite es 10 MB).
- La primera petición después de un rato sin uso tarda un poco más, porque la función se vuelve a encender.
- El plan gratuito de la base y de Blob tiene poco espacio: alcanza para revisar, no para operar.

## Variables de entorno

Se escriben en **Vercel → Project → Settings → Environment Variables**, nunca en el repositorio ni en el chat (`AGENTS.md`, Seguridad). Aquí solo van los nombres.

**Proyecto de la API (`backend/`):**

| Variable | Qué es |
| :--- | :--- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Datos de la base en la nube. |
| `DB_SSL` | `true`: la conexión va cifrada y se revisa el certificado. |
| `DB_SSL_CA` | Certificado público del proveedor (en Aiven: *CA certificate*). Puede ir en una sola línea con `\n`. |
| `DB_TIMEZONE` | `-06:00`, la hora del centro de México (no tiene horario de verano). |
| `JWT_SECRET` | Frase larga y aleatoria, distinta de la de local. |
| `CORS_ORIGIN` | Dirección de la web en Vercel, por ejemplo `https://portal-web.vercel.app`. |
| `PORTAL_URL` | La misma dirección, con `/` al final: es el enlace de los correos. |
| `BLOB_READ_WRITE_TOKEN` | Vercel la pone sola al conectar el almacén de Blob al proyecto. |
| `SMTP_*` | Opcionales: sin ellas, no se mandan correos. |

**Proyecto de la web (`frontend/`):**

| Variable | Qué es |
| :--- | :--- |
| `VITE_API_URL` | Dirección de la API en Vercel con `/api` al final, por ejemplo `https://portal-api.vercel.app/api`. |

## Pasos (una sola vez)

1. Crea una cuenta en [Vercel](https://vercel.com), instala su herramienta con `npm i -g vercel` y entra con `vercel login`.
2. Crea la base MySQL en Aiven (o el proveedor que elijan) y descarga su certificado CA.
3. Crea el proyecto de la API: en `backend/`, corre `vercel link` y elige crear un proyecto nuevo, por ejemplo `portal-api`. En el panel de Vercel, dentro de ese proyecto:
   - En **Storage**, crea un almacén **Blob** con acceso **privado** y conéctalo al proyecto.
   - En **Settings → Environment Variables**, agrega las variables de la API de la tabla de arriba. `CORS_ORIGIN` y `PORTAL_URL` se llenan en el paso 7.
   - En **Settings → Deployment Protection**, desactiva **Vercel Authentication** para que el equipo entre sin cuenta de Vercel.
4. En `backend/`, copia `.env.example` como `.env.nube` y llénalo con los mismos datos de la base y el `BLOB_READ_WRITE_TOKEN` del almacén (está en **Storage → Blob → .env.local**). Ese archivo no se sube a git (`.gitignore`) ni a Vercel (`.vercelignore`).
5. Carga las tablas y los datos de prueba en la base de la nube. El contrato de ejemplo se sube a Blob:

   ```bash
   cd backend
   ENV_FILE=.env.nube node scripts/cargar-esquema.js   # pide escribir el nombre de la base para confirmar
   ENV_FILE=.env.nube node scripts/datos-prueba.js     # pide la contraseña de las cuentas de prueba
   ```

6. Publica la API con `vercel --prod` (en `backend/`) y anota su dirección.
7. Publica la web: en `frontend/`, corre `vercel link` (proyecto nuevo, por ejemplo `portal-web`), agrega `VITE_API_URL` con la dirección de la API, desactiva también la protección y corre `vercel --prod`. Luego pon la dirección de la web en `CORS_ORIGIN` y `PORTAL_URL` del proyecto de la API y vuelve a publicarla con `vercel --prod` en `backend/`.
8. Comprueba que `https://<api>.vercel.app/api/salud` responda `{"ok":true,...}` y que en la web entren las cuentas de prueba.

## Para publicar un cambio

```bash
cd backend && vercel --prod    # si cambió la API
cd frontend && vercel --prod   # si cambió la web
```

Si cambió `database/schema.sql`, vuelve a correr el paso 5: borra los datos de la nube y los carga de nuevo.

Más adelante, si el equipo conecta el repositorio en Vercel (**Settings → Git**), cada push a una rama genera su propia dirección de prueba y cada integración a `main` publica la versión estable.

## Problemas comunes

- **`vercel: command not found` después de instalarlo.** La carpeta de los paquetes globales de npm no está en el `PATH`. Revisa cuál es con `npm prefix -g`, agrega `export PATH="<esa carpeta>/bin:$PATH"` al final de `~/.zshrc` y abre otra terminal.
- **La publicación queda en «Blocked»** («the commit author doesn't have permission»). Vercel revisa el correo del último commit de git. Agrega ese correo a tu cuenta en **Vercel → Account Settings**, o publica desde una copia de la carpeta sin `.git`.
- **`vercel link` crea un `.gitignore` dentro de `backend/` o `frontend/`.** Bórralo: el `.gitignore` de la raíz ya ignora `.vercel/` y los `.env.*`, y el que crea Vercel también oculta `.env.example`.
- **La web dice que no se pudo conectar.** Revisa que `CORS_ORIGIN` de la API sea exactamente la dirección de la web (sin `/` al final) y que la API se haya vuelto a publicar después de cambiarla.

