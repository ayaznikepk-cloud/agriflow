alter table public.crop_cycles
  drop constraint if exists crop_cycles_status_check;

update public.crop_cycles
set status = 'harvest_complete'
where status = 'harvested';

alter table public.crop_cycles
  add constraint crop_cycles_status_check
  check (status in ('planned','active','harvesting','harvest_complete','closed','cancelled'));
