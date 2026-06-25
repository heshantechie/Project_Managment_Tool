-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up a trigger to automatically create a profile for a new user
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS on other tables (if not already enabled)
alter table public.dashboard_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_items enable row level security;

-- Add policies to allow all authenticated users full access to these tables
create policy "Authenticated users can select dashboard_items" on dashboard_items for select to authenticated using (true);
create policy "Authenticated users can insert dashboard_items" on dashboard_items for insert to authenticated with check (true);
create policy "Authenticated users can update dashboard_items" on dashboard_items for update to authenticated using (true);
create policy "Authenticated users can delete dashboard_items" on dashboard_items for delete to authenticated using (true);

create policy "Authenticated users can select projects" on projects for select to authenticated using (true);
create policy "Authenticated users can insert projects" on projects for insert to authenticated with check (true);
create policy "Authenticated users can update projects" on projects for update to authenticated using (true);
create policy "Authenticated users can delete projects" on projects for delete to authenticated using (true);

create policy "Authenticated users can select project_items" on project_items for select to authenticated using (true);
create policy "Authenticated users can insert project_items" on project_items for insert to authenticated with check (true);
create policy "Authenticated users can update project_items" on project_items for update to authenticated using (true);
create policy "Authenticated users can delete project_items" on project_items for delete to authenticated using (true);
