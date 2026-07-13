# Viajecito ✈️

App web para organizar viajes en grupo de forma colaborativa: itinerario,
vuelos, hospedaje, gastos compartidos (estilo Splitwise), chat interno en
tiempo real y recordatorios en Google Calendar.

Cada viaje es un **espacio aislado**: un mismo organizador puede tener varios
viajes en simultáneo con grupos distintos, sin que la información se mezcle.
El aislamiento se garantiza con **Row Level Security (RLS)** en Supabase.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend / DB / Auth / Realtime:** Supabase (Postgres, Auth con Google, Realtime, RLS)
- **Calendario:** Google Calendar API (OAuth 2.0)
- **Hosting objetivo:** Vercel (frontend) + Supabase Cloud (backend)

## Requisitos

- Node.js 20+ (probado con v22)
- Una cuenta en [Supabase](https://supabase.com) (para las fases 2 en adelante)

## Setup local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.local.example .env.local
   ```

   Y completar los valores (URL y claves de tu proyecto Supabase). Están
   documentados dentro del propio archivo `.env.local.example`.

   > En la Fase 1 la app arranca aunque no tengas Supabase configurado
   > todavía: la landing no depende de la base. Los valores se vuelven
   > necesarios a partir de la Fase 2 (login con Google).

3. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000).

## Estructura de carpetas

```
src/
  app/                 # Rutas (App Router)
  components/          # Componentes de UI reutilizables (a partir de Fase 2)
  lib/
    supabase/
      client.ts        # Cliente Supabase para el navegador (Client Components)
      server.ts        # Cliente Supabase para el servidor (Server Components/Actions)
      proxy-session.ts # Refresco de sesión (usado por el Proxy)
  types/
    database.types.ts  # Tipos autogenerados desde el esquema de Supabase
  proxy.ts             # Proxy de Next.js 16 (antes "middleware")
```

## Notas de arquitectura

- **`proxy.ts` en vez de `middleware.ts`:** Next.js 16 renombró la convención
  `middleware` a `proxy`. Cumple la misma función (correr código en el servidor
  antes de renderizar cada request); acá lo usamos para refrescar la sesión.
- **Tres clientes de Supabase:** navegador, servidor y proxy. Es el patrón
  recomendado por `@supabase/ssr` para que la sesión funcione en todos lados.
- **Seguridad:** el aislamiento entre viajes se hace con RLS en la base, no en
  el código de la app. Se define en la Fase 3.

## Roadmap por fases

1. ✅ **Setup inicial** — Next.js + TS + Tailwind + conexión a Supabase + estructura.
2. ⬜ **Autenticación** — login con Google vía Supabase Auth, sesión, perfil.
3. ⬜ **Viajes e invitaciones** — crear viaje, invitar por link, roles, RLS.
4. ⬜ **Itinerario, vuelos y hospedaje** — carga y edición manual.
5. ⬜ **Gastos compartidos** — división y cálculo de saldos.
6. ⬜ **Chat interno** — mensajes en tiempo real con Supabase Realtime.
7. ⬜ **Google Calendar** — creación automática de eventos.
8. ⬜ **Higgsfield (MCP)** — generación de imágenes/video con IA.
