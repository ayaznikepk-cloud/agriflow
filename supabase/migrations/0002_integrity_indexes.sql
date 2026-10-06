-- Integrity and performance additions applied after the Phase 1 foundation.
alter table public.fields add constraint fields_farm_id_id_key unique (farm_id,id);
alter table public.crop_varieties add constraint crop_varieties_crop_id_id_key unique (crop_id,id);
alter table public.crop_cycles drop constraint crop_cycles_field_id_fkey;
alter table public.crop_cycles drop constraint crop_cycles_variety_id_fkey;
alter table public.crop_cycles add constraint crop_cycles_farm_id_field_id_fkey foreign key (farm_id,field_id) references public.fields(farm_id,id) on delete restrict;
alter table public.crop_cycles add constraint crop_cycles_crop_id_variety_id_fkey foreign key (crop_id,variety_id) references public.crop_varieties(crop_id,id) on delete restrict;
create index crop_cycles_farm_field_idx on public.crop_cycles(farm_id,field_id);
create index crop_cycles_crop_variety_idx on public.crop_cycles(crop_id,variety_id);