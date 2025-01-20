-- Add policy for editors to view active users
create policy "Editors can view active users"
    on user_management for select
    to authenticated
    using (
        -- Allow if the authenticated user is an editor and the target user is active
        (auth.is_editor(auth.uid()) and role = 'user' and is_active = true)
        -- Or if it's their own record
        or (auth.uid() = user_id)
        -- Or if they're an admin (keeping existing admin access)
        or auth.is_admin(auth.uid())
    );
