-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists opportunities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  effort_level text not null check (effort_level in ('low', 'high')),
  impact_score text not null check (impact_score in ('low', 'high')),
  quadrant text not null check (quadrant in ('quick_wins', 'big_bets', 'fill_ins', 'hard_slogs')),
  priority_tag text check (priority_tag in ('critical', 'high', 'medium', 'low')),
  notes text,
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table opportunities enable row level security;

-- Policy: users can only see and manage their own opportunities
create policy "Users manage own opportunities"
  on opportunities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger opportunities_updated_at
  before update on opportunities
  for each row execute function update_updated_at();
