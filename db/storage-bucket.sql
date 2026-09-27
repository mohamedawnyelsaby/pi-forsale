-- Run once in the Supabase SQL Editor, after setup.sql, to enable listing photo uploads.
-- Creates a public storage bucket; reads are public, writes only happen from the server
-- using the service-role key (which bypasses Row Level Security), so no object policies
-- are needed here.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;
