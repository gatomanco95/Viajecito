# Fase 2 — Guía de configuración (Supabase + Google)

Esta guía es para que **vos** (no el código) dejes lista la infraestructura de
autenticación. Son tres bloques: crear el proyecto en Supabase, crear las
credenciales OAuth en Google Cloud, y conectarlas. Toma ~20 minutos.

Al final, completás el `.env.local`, corrés la migración de la base y el login
con Google funciona de punta a punta.

---

## 1) Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta (o logueate).
2. **New project** → elegí una organización, ponele nombre `viajecito`,
   generá una contraseña de base de datos (guardala) y elegí la región más
   cercana (ej. `South America (São Paulo)`).
3. Esperá ~2 minutos a que se aprovisione.
4. Andá a **Project Settings → API** y copiá estos tres valores al `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

> La `service_role` es SECRETA y saltea toda la seguridad. Nunca la pongas en
> el navegador ni la subas al repo. En `.env.local` está bien (ese archivo no
> se versiona).

---

## 2) Correr la migración de la base

Necesitamos crear la tabla `profiles` con su trigger y sus policies de RLS.

**Opción A — SQL Editor (la más simple):**

1. En Supabase, andá a **SQL Editor → New query**.
2. Abrí el archivo `supabase/migrations/0001_profiles.sql` de este repo,
   copiá todo su contenido, pegalo y dale **Run**.
3. Deberías ver "Success". Verificá en **Table Editor** que aparezca `profiles`.

**Opción B — Supabase CLI (si preferís consola):**

```bash
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

---

## 3) Crear las credenciales OAuth en Google Cloud

1. Entrá a [console.cloud.google.com](https://console.cloud.google.com).
2. Arriba, **Select a project → New project**. Nombre: `Viajecito`. Creá.
3. Con el proyecto seleccionado, andá a **APIs & Services → OAuth consent screen**:
   - **User Type: External** → Create.
   - Completá: nombre de la app (`Viajecito`), email de soporte (el tuyo),
     email del desarrollador (el tuyo). El resto se puede dejar por defecto.
   - **Publishing status: Testing** (dejalo así, es lo que pediste).
   - En **Test users**, agregá tu email y los de tu círculo cercano. Solo esos
     emails van a poder loguearse mientras esté en modo Testing.
4. Andá a **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - **Application type: Web application**.
   - Nombre: `Viajecito Web`.
   - **Authorized JavaScript origins**: agregá
     - `http://localhost:3000`
   - **Authorized redirect URIs**: agregá la URL de callback **de Supabase**
     (no la de tu app). La encontrás en el paso 4. Tiene esta forma:
     - `https://TU-PROYECTO.supabase.co/auth/v1/callback`
   - Create. Google te muestra un **Client ID** y un **Client Secret**: copialos.

> ⚠️ Detalle clave que confunde a todos: en "redirect URIs" va la URL de
> **Supabase** (`.../auth/v1/callback`), NO la de nuestra app
> (`/auth/callback`). Supabase es el intermediario del OAuth; recibe el
> callback de Google y recién después manda al usuario a nuestra app.

---

## 4) Conectar Google con Supabase

1. En Supabase, andá a **Authentication → Sign In / Providers → Google**.
2. Activá el toggle **Enable Sign in with Google**.
3. Pegá el **Client ID** y el **Client Secret** que te dio Google.
4. Copiá de ahí la **Callback URL (for OAuth)** que muestra Supabase y confirmá
   que sea exactamente la que cargaste en Google en el paso 3 (la de
   `.../auth/v1/callback`).
5. Guardá.

### URLs de redirección permitidas en Supabase

En **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (después, en producción, la de Vercel).
- **Redirect URLs**: agregá `http://localhost:3000/**` para permitir volver a
  cualquier ruta local tras el login.

---

## 5) Probar

```bash
cp .env.local.example .env.local   # si no lo hiciste
# completá los valores del paso 1
npm run dev
```

1. Abrí `http://localhost:3000` → clic en **Iniciar sesión**.
2. **Continuar con Google** → elegí tu cuenta (tiene que ser un test user).
3. Volvés a la home y deberías ver "Hola, [tu nombre] 👋" con tu foto.
4. En Supabase → **Table Editor → profiles** debería aparecer tu fila.
5. **Cerrar sesión** te devuelve al login.

Si algo falla, lo más común es una redirect URI mal cargada (paso 3/4) o un
email que no está en la lista de test users.

---

## Checklist rápido

- [ ] Proyecto Supabase creado y `.env.local` completo (3 valores).
- [ ] Migración `0001_profiles.sql` corrida (tabla `profiles` existe).
- [ ] Proyecto Google Cloud en modo Testing con test users.
- [ ] OAuth Client creado; redirect URI = callback de Supabase.
- [ ] Provider Google habilitado en Supabase con Client ID/Secret.
- [ ] Site URL y Redirect URLs configuradas en Supabase.
- [ ] Login probado: aparece el perfil y se crea la fila en `profiles`.
