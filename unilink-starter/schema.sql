-- Supabase schema for Unilink MVP
create extension if not exists "uuid-ossp";

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text,
  price numeric,
  type text,
  country text,
  school text,
  campus text,
  contact text,
  urgent boolean default false,
  user_id text,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  school_id text not null,
  rating int not null check (rating between 1 and 5),
  content text,
  is_verified boolean default false,
  user_id text,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  type text default 'general',
  content text not null,
  images text[],
  contact text,
  user_id text,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key,
  email text,
  wechat text,
  type text default 'other', -- 'student' | 'other'
  membership_level text,     -- 'vip' | null
  membership_expires_at timestamptz,
  verification_level text,   -- 'strong' | 'pending' | null
  verification_expires_at timestamptz,
  enroll_year int,
  program_years int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
