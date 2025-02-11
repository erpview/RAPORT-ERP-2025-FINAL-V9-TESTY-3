-- Create survey_drafts table
create table if not exists public.survey_drafts (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    system_id uuid references public.systems(id) on delete cascade,
    form_data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, system_id)
);

-- Add RLS policies
alter table public.survey_drafts enable row level security;

-- Users can only see their own drafts
create policy "Users can view their own drafts"
    on public.survey_drafts for select
    using (auth.uid() = user_id);

-- Users can insert their own drafts
create policy "Users can insert their own drafts"
    on public.survey_drafts for insert
    with check (auth.uid() = user_id);

-- Users can update their own drafts
create policy "Users can update their own drafts"
    on public.survey_drafts for update
    using (auth.uid() = user_id);

-- Users can delete their own drafts
create policy "Users can delete their own drafts"
    on public.survey_drafts for delete
    using (auth.uid() = user_id);

-- Add function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Add trigger for updated_at
create trigger handle_updated_at
    before update on public.survey_drafts
    for each row
    execute function public.handle_updated_at();
