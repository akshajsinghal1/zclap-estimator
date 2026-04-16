create extension if not exists pgcrypto;

create table if not exists public.estimator_requests (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'done')),
  estimator_type text not null default 'implementation',
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  company text not null default '',
  role text not null default '',
  source jsonb not null default '{}'::jsonb,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  estimate_text text not null default '',
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists estimator_requests_status_idx
  on public.estimator_requests (status);

create index if not exists estimator_requests_created_at_idx
  on public.estimator_requests (created_at desc);
