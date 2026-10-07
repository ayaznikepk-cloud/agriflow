-- Shared farm access.
-- Owners retain ownership; members can access the same operational farm data.

create table public.farm_members (
  farm_id uuid not null references public.farms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (farm_id, user_id)
);

alter table public.farm_members enable row level security;

create or replace function public.is_farm_member(p_farm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.farms f
    where f.id = p_farm_id
      and f.owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.farm_members fm
    where fm.farm_id = p_farm_id
      and fm.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_farm_member(uuid) from public;
grant execute on function public.is_farm_member(uuid) to authenticated;

create policy "members read memberships" on public.farm_members
for select to authenticated using (public.is_farm_member(farm_id));

create policy "members select farms" on public.farms
for select to authenticated using (public.is_farm_member(id));

create policy "members select fields" on public.fields
for select to authenticated using (public.is_farm_member(farm_id));
create policy "members insert fields" on public.fields
for insert to authenticated with check (public.is_farm_member(farm_id));
create policy "members update fields" on public.fields
for update to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members delete fields" on public.fields
for delete to authenticated using (public.is_farm_member(farm_id));

create policy "members select crop cycles" on public.crop_cycles
for select to authenticated using (public.is_farm_member(farm_id));
create policy "members insert crop cycles" on public.crop_cycles
for insert to authenticated with check (public.is_farm_member(farm_id));
create policy "members update crop cycles" on public.crop_cycles
for update to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members delete crop cycles" on public.crop_cycles
for delete to authenticated using (public.is_farm_member(farm_id));

create policy "members manage activities" on public.activities
for all to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members manage tasks" on public.tasks
for all to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members manage expenses" on public.expenses
for all to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members manage harvests" on public.harvests
for all to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members manage buyers" on public.buyers
for all to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));
create policy "members manage sales" on public.sales
for all to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id));

-- Keep owner membership explicit for future role management.
insert into public.farm_members (farm_id, user_id, role)
select id, owner_id, 'owner' from public.farms
on conflict do nothing;
