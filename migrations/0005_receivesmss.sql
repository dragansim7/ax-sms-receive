insert into numbers (id, e164, country_code, country_name, label, carrier)
values
  ('61468279945', '+61468279945', 'AU', 'Australia', 'RS 79945', 'receive-smss'),
  ('61485922587', '+61485922587', 'AU', 'Australia', 'RS 22587', 'receive-smss'),
  ('61483966924', '+61483966924', 'AU', 'Australia', 'RS 66924', 'receive-smss')
on conflict (id) do nothing;
