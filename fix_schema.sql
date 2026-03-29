-- Fix resources table — add missing columns
-- Run this in Supabase SQL Editor before seeding

-- Drop and recreate clean (safe — table is empty)
drop table if exists resources cascade;

create table resources (
  id            uuid primary key default gen_random_uuid(),
  url           text unique not null,
  title_pt      text,
  title_en      text,
  author        text,
  year          int,
  type          text,        -- video, article, document, instagram, community, shop, tool, book, podcast, database, app, link
  source        text,        -- YouTube, Google Drive, Slacktivity, ISA, etc.
  section       text,        -- guide section (e.g. "Como montar um Highline?")
  subsection    text,        -- guide subsection if any
  language      text,        -- 'pt' or 'en'
  tags          text[],      -- derived tags
  created_at    timestamptz default now()
);

-- Enable RLS
alter table resources enable row level security;

-- Allow public read
create policy "Public read" on resources
  for select using (true);

-- Confirm
select 'resources table ready ✓' as status;
