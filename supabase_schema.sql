-- 1. Enable pgvector extension for AI RAG
create extension if not exists vector;

-- 2. Create Organizations Table
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  plan_type text default 'trial',
  wallet_balance decimal(10, 2) default 0.00,
  billing_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Users Table (Links to Supabase Auth)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  organization_id uuid references public.organizations(id),
  email text not null,
  role text default 'viewer' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Agents Table
create table public.agents (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  phone_number_id text, -- ID from provider
  system_prompt text,
  voice_settings jsonb default '{}'::jsonb,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Knowledge Base Table (RAG)
create table public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references public.agents(id) on delete cascade not null,
  content_text text,
  embedding_vector vector(1536), -- Standard OpenAI/embedding size
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Customers Table (CRM)
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  phone text not null,
  name text,
  email text,
  reputation_score int default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Calls Table
create table public.calls (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  agent_id uuid references public.agents(id),
  customer_id uuid references public.customers(id),
  direction text check (direction in ('inbound', 'outbound')),
  duration int default 0,
  recording_url text,
  status text,
  cost decimal(10, 4) default 0.0000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Enable Row Level Security (RLS)
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.agents enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.customers enable row level security;
alter table public.calls enable row level security;

-- 9. Basic RLS Policies (Security)
-- Users can only view their own organization data
create policy "Users can view own organization"
  on public.organizations for select
  using ( id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can view own profile"
  on public.users for select
  using ( id = auth.uid() );

create policy "Users can view organization agents"
  on public.agents for select
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can view organization customers"
  on public.customers for select
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can view organization calls"
  on public.calls for select
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

-- 10. Trigger to automatically create user entry after Auth Sign up
-- This version automatically creates an Organization for the new user
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- 1. Create a new Organization for the user
  insert into public.organizations (name, plan_type, wallet_balance)
  values (
    split_part(new.email, '@', 1) || '''s Org', -- Name based on email
    'trial',
    5.00 -- $5.00 Free credit for trial
  )
  returning id into new_org_id;

  -- 2. Create the User profile linked to that Organization
  insert into public.users (id, organization_id, email, role)
  values (
    new.id, 
    new_org_id, 
    new.email, 
    'owner'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
