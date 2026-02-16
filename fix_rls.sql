-- Fix Missing RLS Policies for Insert/Update/Delete

-- Agents
create policy "Users can insert organization agents"
  on public.agents for insert
  with check ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can update organization agents"
  on public.agents for update
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can delete organization agents"
  on public.agents for delete
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

-- Customers
create policy "Users can insert organization customers"
  on public.customers for insert
  with check ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can update organization customers"
  on public.customers for update
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

-- Calls
create policy "Users can insert organization calls"
  on public.calls for insert
  with check ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );

create policy "Users can update organization calls"
  on public.calls for update
  using ( organization_id in (select organization_id from public.users where users.id = auth.uid()) );
