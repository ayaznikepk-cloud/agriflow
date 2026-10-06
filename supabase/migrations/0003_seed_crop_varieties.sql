insert into public.crop_varieties(crop_id,name)
select c.id,v.name from public.crops c
join (values ('Wheat','Akbar-2019'),('Wheat','Ghazi-2019'),('Rice','Super Basmati'),('Rice','Kainat 1121'),('Maize','Hybrid'),('Cotton','FH-142'),('Sugarcane','CPF-253')) as v(crop_name,name)
on c.name=v.crop_name
on conflict (crop_id,name) do nothing;