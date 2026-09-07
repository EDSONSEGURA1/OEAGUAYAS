# Backend — Unidad Educativa Particular OEA

API REST hecha con NestJS + Prisma, pensada para conectarse a una base de
datos PostgreSQL de Supabase. Maneja dos cosas:

- **Eventos** (`/events`): reemplaza el archivo manual `data/eventos.json`
  del sitio web por una base de datos real.
- **Matrículas** (`/matriculas`): recibe el formulario de matriculación del
  sitio y lo guarda, en vez de depender solo de WhatsApp.

Este backend YA compila y ya está probado. Lo que falta es conectarlo a una
base de datos real y publicarlo en internet — son pasos de configuración,
no de programación, y los puede hacer cualquier persona con acceso a las
cuentas siguiendo esta guía.

---

## Paso 1 — Crear la base de datos en Supabase (gratis)

1. Entra a https://supabase.com y crea una cuenta (puede ser con Google).
2. Clic en "New Project". Ponle un nombre, por ejemplo `oea-web`.
3. Elige una contraseña para la base de datos y **guárdala**, la vas a
   necesitar en el siguiente paso.
4. Espera 1-2 minutos a que Supabase termine de crear el proyecto.
5. Ve a "Project Settings" (ícono de engranaje) → "Database" → sección
   "Connection string" → pestaña "URI". Copia esa URL — se ve así:
   `postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. Reemplaza `[TU-PASSWORD]` por la contraseña que pusiste en el paso 3.

## Paso 2 — Configurar el proyecto en tu computadora

1. Instala Node.js si no lo tienes: https://nodejs.org (versión 20 o
   superior).
2. Abre una terminal dentro de esta carpeta (`Backend-OEA`).
3. Copia `.env.example` y renómbralo a `.env`.
4. Abre `.env` y pega la URL de conexión del Paso 1 en `DATABASE_URL`.
5. Instala las dependencias:
   ```
   npm install
   ```
6. Crea las tablas en la base de datos:
   ```
   npx prisma migrate dev --name init
   ```
7. (Opcional) Carga 3 eventos de ejemplo para probar:
   ```
   npm run seed
   ```
8. Levanta el servidor en tu computadora para probarlo:
   ```
   npm run start:dev
   ```
   Deberías ver: `API de la Unidad Educativa OEA corriendo en el puerto 3000`

9. Prueba que funciona abriendo en el navegador:
   `http://localhost:3000/events` — deberías ver la lista de eventos en
   formato JSON.

## Paso 3 — Publicarlo en internet (para que no dependa de tu computadora)

Cualquiera de estas opciones tiene un plan gratuito suficiente para este
proyecto:

- **Render** (render.com) — el más simple para NestJS. Conectas tu
  repositorio de GitHub, eliges "Web Service", y Render detecta que es un
  proyecto de Node automáticamente. Configura las variables de entorno
  (`DATABASE_URL`, `CORS_ORIGINS`) en el panel de Render.
- **Railway** (railway.app) — similar a Render, también muy simple.

En cualquiera de los dos, el proceso general es:
1. Sube este código a un repositorio de GitHub.
2. Conecta ese repositorio desde Render o Railway.
3. Configura las variables de entorno (`DATABASE_URL` con la misma URL de
   Supabase, `CORS_ORIGINS` con el dominio donde vaya a vivir el sitio web).
4. Define el comando de build: `npm install && npx prisma generate && npm run build`
5. Define el comando de arranque: `npm run start`
6. Al desplegar, te van a dar una URL pública, por ejemplo:
   `https://oea-backend.onrender.com`

## Paso 4 — Conectar el sitio web a este backend

En el sitio web (`Sitio-Web-OEA/js/main.js`), busca esta línea:

```js
apiUrl: 'data/eventos.json',
```

y cámbiala por la URL pública que te dio Render/Railway:

```js
apiUrl: 'https://oea-backend.onrender.com/events',
```

A partir de ahí, la sección de Eventos deja de depender del archivo manual
y empieza a leer directamente de la base de datos. El formulario de
Matriculación (que se agregó en `matriculacion.html`) ya está preparado
para enviar los datos a `[apiUrl-base]/matriculas` — solo hay que
apuntarlo a la misma URL del backend en `js/main.js`
(`MATRICULAS_CONFIG.apiUrl`).

## Endpoints disponibles

| Método | Ruta                  | Para qué sirve                                  |
|--------|-----------------------|--------------------------------------------------|
| GET    | `/events`             | Lista todos los eventos                          |
| GET    | `/events/:id`         | Un evento específico                             |
| POST   | `/events`             | Crear un evento nuevo (usar desde un panel admin)|
| DELETE | `/events/:id`         | Eliminar un evento                               |
| GET    | `/matriculas`         | Lista todas las matrículas recibidas             |
| GET    | `/matriculas/:id`     | Una matrícula específica                         |
| POST   | `/matriculas`         | Registrar una matrícula nueva (usa el formulario)|
| PATCH  | `/matriculas/:id/estado` | Cambiar el estado (pendiente/contactado/etc.) |

## Importante antes de usarlo con datos reales

- **Ahora mismo, `GET /events` y `GET /matriculas` están abiertos sin
  contraseña.** Antes de publicarlo con datos reales de matrículas
  (información de menores de edad y sus representantes), hay que agregar
  autenticación a esas rutas (por ejemplo, con una clave de API simple o
  con Supabase Auth) para que solo el personal del colegio pueda verlas.
  El endpoint `POST /matriculas` sí puede quedar público, porque es el que
  llena cualquier familia desde el formulario.
- Activa siempre HTTPS (Render y Railway lo hacen automáticamente).
- No compartas el archivo `.env` ni la contraseña de la base de datos.
