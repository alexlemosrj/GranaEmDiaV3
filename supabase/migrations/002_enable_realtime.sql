-- Enable realtime for all tables
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.profiles;