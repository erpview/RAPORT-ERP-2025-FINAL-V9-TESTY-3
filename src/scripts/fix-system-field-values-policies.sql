-- Drop existing policies if they exist
drop policy if exists "Editors can manage field values" on system_field_values;
drop policy if exists "Editors can view field values" on system_field_values;

-- Enable RLS
alter table system_field_values enable row level security;

-- Allow editors to insert/update/delete field values for their systems
create policy "Editors can manage field values"
    on system_field_values
    for all
    to authenticated
    using (
        -- Allow if user is an editor for this system
        exists (
            select 1 from system_editors
            where system_id = system_field_values.system_id
            and editor_id = auth.uid()
        )
        -- Or if they're an admin
        or auth.is_admin(auth.uid())
    )
    with check (
        -- Allow if user is an editor for this system
        exists (
            select 1 from system_editors
            where system_id = system_field_values.system_id
            and editor_id = auth.uid()
        )
        -- Or if they're an admin
        or auth.is_admin(auth.uid())
    );

-- Grant appropriate permissions
grant all on system_field_values to authenticated;
grant all on system_field_values to service_role;
