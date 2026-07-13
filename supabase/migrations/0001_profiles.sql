-- ─────────────────────────────────────────────────────────────
-- Migración 0001: perfiles de usuario
-- ─────────────────────────────────────────────────────────────
-- Supabase ya tiene su propia tabla `auth.users` (identidad + login).
-- NO la tocamos. En su lugar creamos `public.profiles`, una tabla espejo
-- con los datos que la app necesita mostrar (nombre, foto, email) y sobre
-- la que SÍ podemos aplicar Row Level Security y hacer JOINs cómodos.
--
-- Cómo aplicar esta migración:
--   Opción A (rápida): copiar/pegar este archivo en Supabase -> SQL Editor.
--   Opción B (CLI): supabase db push
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  -- Mismo id que auth.users. Si se borra el usuario, se borra el perfil.
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Datos de perfil visibles en la app. Espejo de auth.users.';

-- ─────────────────────────────────────────────────────────────
-- Autocompletar el perfil al registrarse
-- ─────────────────────────────────────────────────────────────
-- Cuando Supabase crea un usuario nuevo en auth.users (al loguearse con
-- Google por primera vez), este trigger copia sus datos a public.profiles.
-- Google devuelve el nombre/foto dentro de raw_user_meta_data.
--
-- SECURITY DEFINER: la función corre con permisos del dueño (postgres),
-- así puede insertar en profiles salteando RLS. Es seguro porque solo se
-- dispara desde el trigger de auth.users, no es invocable por el cliente.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
-- Encendemos RLS y, por ahora, cada usuario solo puede ver y editar SU
-- propio perfil. En la Fase 3 vamos a ampliar el "ver" para que también
-- se puedan ver los perfiles de los compañeros de un mismo viaje.

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
