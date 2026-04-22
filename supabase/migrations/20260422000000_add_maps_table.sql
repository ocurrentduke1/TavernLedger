-- Create maps table
create table maps (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade,
  name text not null,
  description text,
  image_url text not null,
  grid_size integer default 70,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create map_tokens table
create table map_tokens (
  id uuid default gen_random_uuid() primary key,
  map_id uuid references maps(id) on delete cascade,
  character_id uuid references characters(id) on delete set null,
  x integer not null,
  y integer not null,
  color text default '#c9a84c',
  label text,
  size integer default 40,
  created_at timestamp with time zone default now()
);

-- Function to update updated_at on maps
create or replace function update_maps_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger maps_updated_at_trigger
  before update on maps
  for each row
  execute function update_maps_updated_at();

-- Enable RLS
alter table maps enable row level security;
alter table map_tokens enable row level security;

-- Policies for maps
create policy "Users can view campaign maps"
  on maps for select
  using (
    auth.uid() = (
      select dm_id from campaigns where id = maps.campaign_id
    )
  );

create policy "DMs can manage their campaign maps"
  on maps for all
  using (
    auth.uid() = (
      select dm_id from campaigns where id = maps.campaign_id
    )
  );

-- Policies for map_tokens
create policy "Users can view map tokens"
  on map_tokens for select
  using (
    auth.uid() = (
      select dm_id from campaigns where id = (
        select campaign_id from maps where id = map_tokens.map_id
      )
    )
  );

create policy "DMs can manage map tokens"
  on map_tokens for all
  using (
    auth.uid() = (
      select dm_id from campaigns where id = (
        select campaign_id from maps where id = map_tokens.map_id
      )
    )
  );
