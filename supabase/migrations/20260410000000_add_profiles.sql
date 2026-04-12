-- Tabla de perfiles de usuario (datos extra además de auth.users)
create table profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique,
  display_name text,
  avatar_url  text,
  bio         text,
  preferred_role text default 'player' check (preferred_role in ('player', 'dm', 'both')),
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

-- RLS
alter table profiles enable row level security;

-- Cualquiera autenticado puede leer perfiles (para mostrar nombres en campañas, etc.)
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

-- Solo el dueño puede actualizar su perfil
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Solo el dueño puede insertar su perfil
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Función para auto-crear perfil cuando se registra un nuevo usuario
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: se dispara después de cada nuevo usuario en auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Función para mantener updated_at actualizado
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
