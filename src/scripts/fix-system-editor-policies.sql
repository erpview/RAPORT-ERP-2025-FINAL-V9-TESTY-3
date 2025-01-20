-- Drop existing policies if they exist
drop policy if exists "Editors can insert systems" on systems;
drop policy if exists "Editors can update their systems" on systems;
drop policy if exists "Editors can view systems" on systems;

-- Allow editors to insert new systems
create policy "Editors can insert systems"
    on systems for insert
    to authenticated
    with check (
        -- Allow if user is an editor
        exists (
            select 1 from user_management
            where user_id = auth.uid()
            and role = 'editor'
        )
    );

-- Allow editors to update systems they are assigned to
create policy "Editors can update their systems"
    on systems for update
    to authenticated
    using (
        -- Allow if user is an editor for this system
        exists (
            select 1 from system_editors
            where system_id = id
            and editor_id = auth.uid()
        )
    )
    with check (
        -- Allow if user is an editor for this system
        exists (
            select 1 from system_editors
            where system_id = id
            and editor_id = auth.uid()
        )
    );

-- Allow editors to view systems they are assigned to
create policy "Editors can view systems"
    on systems for select
    to authenticated
    using (
        -- Allow if user is an editor for this system
        exists (
            select 1 from system_editors
            where system_id = id
            and editor_id = auth.uid()
        )
        -- Or if they are an admin
        or auth.is_admin(auth.uid())
    );

-- Ensure RLS is enabled
alter table systems enable row level security;
