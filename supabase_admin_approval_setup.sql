-- Create a table for pending registrations
create table public.pending_registrations (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamp with time zone,
  approved_by uuid references auth.users
);

-- Set up Row Level Security (RLS)
alter table public.pending_registrations enable row level security;

-- Allow anyone to insert a new registration request
create policy "Anyone can insert pending registrations" on pending_registrations
  for insert with check (true);

-- Allow admins to view pending registrations
create policy "Admins can view pending registrations" on pending_registrations
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.email = 'bethahemanth7264@gmail.com'
    )
  );

-- Allow admins to update pending registrations
create policy "Admins can update pending registrations" on pending_registrations
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.email = 'bethahemanth7264@gmail.com'
    )
  );
