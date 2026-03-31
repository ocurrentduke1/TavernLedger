-- Activar RLS en todas las tablas
alter table campaigns enable row level security;
alter table characters enable row level security;
alter table inventory enable row level security;
alter table dice_rolls enable row level security;

-- Políticas para campaigns
create policy "Users can view their own campaigns"
  on campaigns for select
  using (auth.uid() = dm_id);

create policy "Users can create campaigns"
  on campaigns for insert
  with check (auth.uid() = dm_id);

create policy "Users can update their own campaigns"
  on campaigns for update
  using (auth.uid() = dm_id);

create policy "Users can delete their own campaigns"
  on campaigns for delete
  using (auth.uid() = dm_id);

-- Políticas para characters
create policy "Users can view their own characters"
  on characters for select
  using (auth.uid() = user_id);

create policy "Users can create characters"
  on characters for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own characters"
  on characters for update
  using (auth.uid() = user_id);

create policy "Users can delete their own characters"
  on characters for delete
  using (auth.uid() = user_id);

-- Políticas para inventory
create policy "Users can manage their inventory"
  on inventory for all
  using (
    auth.uid() = (
      select user_id from characters
      where id = inventory.character_id
    )
  );

-- Políticas para dice_rolls
create policy "Users can manage their dice rolls"
  on dice_rolls for all
  using (
    auth.uid() = (
      select user_id from characters
      where id = dice_rolls.character_id
    )
  );