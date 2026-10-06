create extension if not exists pgcrypto;

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  location text,
  total_area numeric(14,3) check (total_area is null or total_area >= 0),
  area_unit text not null default 'acre' check (area_unit in ('acre','kanal','marla','hectare')),
  currency text not null default 'PKR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.fields (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  area numeric(14,3) not null check (area > 0),
  area_unit text not null default 'acre' check (area_unit in ('acre','kanal','marla','hectare')),
  soil_type text, irrigation_type text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (farm_id,name)
);
create table public.crops (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now()
);
create table public.crop_varieties (
  id uuid primary key default gen_random_uuid(),
  crop_id uuid not null references public.crops(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (crop_id,name)
);
create table public.crop_cycles (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete restrict,
  crop_id uuid not null references public.crops(id) on delete restrict,
  variety_id uuid references public.crop_varieties(id) on delete set null,
  sowing_date date not null, expected_harvest_date date, actual_harvest_date date,
  planted_area numeric(14,3) not null check (planted_area > 0),
  area_unit text not null default 'acre' check (area_unit in ('acre','kanal','marla','hectare')),
  status text not null default 'planned' check (status in ('planned','active','harvested','cancelled')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (expected_harvest_date is null or expected_harvest_date >= sowing_date),
  check (actual_harvest_date is null or actual_harvest_date >= sowing_date)
);
create index fields_farm_id_idx on public.fields(farm_id);
create index crop_varieties_crop_id_idx on public.crop_varieties(crop_id);
create index crop_cycles_farm_id_idx on public.crop_cycles(farm_id);
create index crop_cycles_field_id_idx on public.crop_cycles(field_id);
create index crop_cycles_crop_id_idx on public.crop_cycles(crop_id);
alter table public.farms enable row level security;
alter table public.fields enable row level security;
alter table public.crops enable row level security;
alter table public.crop_varieties enable row level security;
alter table public.crop_cycles enable row level security;
create policy "farm owners select farms" on public.farms for select to authenticated using ((select auth.uid())=owner_id);
create policy "farm owners insert farms" on public.farms for insert to authenticated with check ((select auth.uid())=owner_id);
create policy "farm owners update farms" on public.farms for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "farm owners delete farms" on public.farms for delete to authenticated using ((select auth.uid())=owner_id);
create policy "owners select fields" on public.fields for select to authenticated using (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "owners insert fields" on public.fields for insert to authenticated with check (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "owners update fields" on public.fields for update to authenticated using (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid()))) with check (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "owners delete fields" on public.fields for delete to authenticated using (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "authenticated read crops" on public.crops for select to authenticated using (true);
create policy "authenticated read varieties" on public.crop_varieties for select to authenticated using (true);
create policy "owners select crop cycles" on public.crop_cycles for select to authenticated using (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "owners insert crop cycles" on public.crop_cycles for insert to authenticated with check (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "owners update crop cycles" on public.crop_cycles for update to authenticated using (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid()))) with check (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "owners delete crop cycles" on public.crop_cycles for delete to authenticated using (exists(select 1 from public.farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
grant select,insert,update,delete on public.farms,public.fields,public.crop_cycles to authenticated;
grant select on public.crops,public.crop_varieties to authenticated;
insert into public.crops(name) values ('Wheat'),('Rice'),('Maize'),('Cotton'),('Sugarcane');
