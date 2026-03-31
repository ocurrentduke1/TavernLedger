-- Campañas
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  dm_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Personajes
create table characters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  campaign_id uuid references campaigns(id),
  name text not null,
  race text,
  class text,
  level integer default 1,
  hp_current integer default 10,
  hp_max integer default 10,
  spell_slots_current integer default 0,
  spell_slots_max integer default 0,
  strength integer default 10,
  dexterity integer default 10,
  constitution integer default 10,
  intelligence integer default 10,
  wisdom integer default 10,
  charisma integer default 10,
  background text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Inventario
create table inventory (
  id uuid default gen_random_uuid() primary key,
  character_id uuid references characters(id) on delete cascade,
  name text not null,
  type text,
  damage text,
  weight numeric,
  description text,
  equipped boolean default false
);

-- Tiradas de dados
create table dice_rolls (
  id uuid default gen_random_uuid() primary key,
  character_id uuid references characters(id) on delete cascade,
  campaign_id uuid references campaigns(id),
  dice_type text not null,
  result integer not null,
  modifier integer default 0,
  rolled_at timestamp with time zone default now()
);