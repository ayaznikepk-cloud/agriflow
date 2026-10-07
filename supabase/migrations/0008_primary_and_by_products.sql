alter table public.harvests
  add column product_name text,
  add column product_kind text not null default 'primary';

alter table public.sales
  add column product_name text,
  add column product_kind text not null default 'primary';

update public.harvests h
set product_name = c.name
from public.crop_cycles cc
join public.crops c on c.id = cc.crop_id
where cc.id = h.crop_cycle_id
  and h.product_name is null;

update public.sales s
set product_name = c.name
from public.crop_cycles cc
join public.crops c on c.id = cc.crop_id
where cc.id = s.crop_cycle_id
  and s.product_name is null;

alter table public.harvests
  alter column product_name set not null,
  add constraint harvests_product_name_not_blank check (char_length(trim(product_name)) > 0),
  add constraint harvests_product_kind_check check (product_kind in ('primary','by_product'));

alter table public.sales
  alter column product_name set not null,
  add constraint sales_product_name_not_blank check (char_length(trim(product_name)) > 0),
  add constraint sales_product_kind_check check (product_kind in ('primary','by_product'));

create index harvests_inventory_lookup_idx
  on public.harvests(crop_cycle_id, product_kind, product_name, unit);

create index sales_inventory_lookup_idx
  on public.sales(crop_cycle_id, product_kind, product_name, unit);
