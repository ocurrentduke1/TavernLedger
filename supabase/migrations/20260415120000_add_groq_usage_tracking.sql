-- Track Groq API usage per user
create table groq_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  month text not null, -- "2024-04" format
  requests_count integer default 0,
  tokens_used integer default 0,
  last_request_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Unique constraint per user per month
  unique(user_id, month)
);

-- Enable RLS
alter table groq_usage enable row level security;

-- Policy: Users can only see their own usage
create policy "Users can view own groq usage"
  on groq_usage
  for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own usage (app only, via trigger)
create policy "Users cannot directly update groq usage"
  on groq_usage
  for update
  using (false); -- Prevent direct updates; use backend function

-- Policy: Prevent insert from users
create policy "Users cannot directly insert groq usage"
  on groq_usage
  for insert
  with check (false); -- Prevent direct inserts; use backend function

-- Create function to safely log usage
create or replace function log_groq_usage(
  user_id_input uuid,
  tokens_input integer
)
returns table(requests_count integer, tokens_used integer, month text) as $$
declare
  current_month text := to_char(now(), 'YYYY-MM');
  v_requests_count integer;
  v_tokens_used integer;
begin
  insert into groq_usage (user_id, month, requests_count, tokens_used, last_request_at)
  values (user_id_input, current_month, 1, tokens_input, now())
  on conflict (user_id, month)
  do update set
    requests_count = groq_usage.requests_count + 1,
    tokens_used = groq_usage.tokens_used + tokens_input,
    last_request_at = now(),
    updated_at = now();

  select groq_usage.requests_count, groq_usage.tokens_used into v_requests_count, v_tokens_used
  from groq_usage
  where groq_usage.user_id = user_id_input
  and groq_usage.month = current_month;

  return query select v_requests_count, v_tokens_used, current_month;
end;
$$ language plpgsql security definer;
