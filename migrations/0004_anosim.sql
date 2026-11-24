insert into numbers (id, e164, country_code, country_name, label, carrier)
values ('61485841378', '+61485841378', 'AU', 'Australia', 'Anosim', 'Anosim')
on conflict (id) do nothing;
