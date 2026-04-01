-- Agregar campos de visibilidad a campaigns
alter table campaigns add column is_public boolean default false;
alter table campaigns add column invite_code text unique;
alter table campaigns add column max_players integer default 6;
alter table campaigns add column current_players integer default 1;
alter table campaigns add column status text default 'active'; -- active, paused, finished

-- Política para que cualquiera pueda VER campañas públicas
create policy "Anyone can view public campaigns"
  on campaigns for select
  using (is_public = true);

-- Función para generar código de invitación automático
create or replace function generate_invite_code()
returns trigger as $$
begin
  new.invite_code := upper(substring(md5(random()::text) from 1 for 8));
  return new;
end;
$$ language plpgsql;

-- Trigger para generar el código al crear una campaña
create trigger set_invite_code
  before insert on campaigns
  for each row
  execute function generate_invite_code();