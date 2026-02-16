-- Trigger: Auto-create Organization and Wallet for new Users
-- This function replaces the basic handle_new_user function created earlier.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- 1. Create a new Organization for the user
  insert into public.organizations (name, plan_type, wallet_balance)
  values (
    split_part(new.email, '@', 1) || '''s Org', -- Name based on email (e.g. "juan's Org")
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
