-- Remove specific users safely
do $$
declare
  user_record record;
begin
  -- List of emails to remove
  for user_record in (
    select id
    from auth.users
    where email in ('p.jaworski@me.com', 'admin@erp-view.pl')
  ) loop
    -- Delete in correct order to avoid foreign key violations
    delete from user_management where user_id = user_record.id;
    delete from auth.identities where user_id = user_record.id;
    delete from auth.users where id = user_record.id;
  end loop;
end $$;