-- Drop existing policies
drop policy if exists "system_editors_insert_policy" on system_editors;
drop policy if exists "system_editors_select_policy" on system_editors;
drop policy if exists "system_editors_delete_policy" on system_editors;

-- Enable RLS
alter table system_editors enable row level security;

-- Allow editors to insert themselves as editors for new systems
create policy "system_editors_insert_policy"
    on system_editors for insert
    to authenticated
    with check (
        -- Allow if the user is an editor and they're adding themselves
        (
            exists (
                select 1 from user_management
                where user_id = auth.uid()
                and role = 'editor'
                and is_active = true
            )
            and editor_id = auth.uid()
        )
        -- Or if they're an admin
        or auth.is_admin(auth.uid())
    );

-- Allow viewing system editor records
create policy "system_editors_select_policy"
    on system_editors for select
    to authenticated
    using (
        -- Allow if user is an editor for this system
        editor_id = auth.uid()
        -- Or if they're an admin
        or auth.is_admin(auth.uid())
    );

-- Allow deleting system editor records
create policy "system_editors_delete_policy"
    on system_editors for delete
    to authenticated
    using (
        -- Only admins can delete editor assignments
        auth.is_admin(auth.uid())
    );
