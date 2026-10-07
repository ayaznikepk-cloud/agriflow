-- Keep the existing shared-workspace behavior when additional farms are created.
create or replace function public.seed_new_farm_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.farm_members (farm_id,user_id,role)
  values (new.id,new.owner_id,'owner')
  on conflict do nothing;

  insert into public.farm_members (farm_id,user_id,role)
  select new.id,u.user_id,'member'
  from (
    select fm.user_id from public.farm_members fm
    union
    select f.owner_id from public.farms f
  ) u
  where u.user_id <> new.owner_id
  on conflict do nothing;
  return new;
end;
$$;

revoke all on function public.seed_new_farm_members() from public;

drop trigger if exists seed_new_farm_members_trigger on public.farms;
create trigger seed_new_farm_members_trigger
after insert on public.farms
for each row execute function public.seed_new_farm_members();

insert into public.farm_members (farm_id,user_id,role)
select f.id,u.user_id,case when u.user_id=f.owner_id then 'owner' else 'member' end
from public.farms f
cross join (
  select fm.user_id from public.farm_members fm
  union
  select f2.owner_id from public.farms f2
) u
on conflict do nothing;
