create table if not exists numbers (
  id text primary key,
  e164 text not null unique,
  country_code text not null,
  country_name text not null,
  label text not null,
  carrier text not null default 'Virtual',
  active boolean not null default true,
  added_at timestamptz not null default now()
);

create table if not exists messages (
  id bigserial primary key,
  number_id text not null references numbers (id),
  from_number text not null,
  sender_name text not null default '',
  body text not null,
  source text not null default 'webhook',
  received_at timestamptz not null default now()
);

create index if not exists messages_number_received_idx
  on messages (number_id, received_at desc);
