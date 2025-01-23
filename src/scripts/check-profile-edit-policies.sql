-- Check policies for profiles table
DO $$ 
DECLARE
    policy_record RECORD;
    policy_count INT;
    editor_policies INT;
    user_policies INT;
    has_update_policy BOOLEAN;
BEGIN
    RAISE NOTICE '=== Checking Profile Edit Policies ===';
    
    -- First check if the profiles table exists
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    ) as table_exists;

    -- Count total policies on profiles table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'profiles';
    
    RAISE NOTICE 'Total policies on profiles table: %', policy_count;
    
    -- Get all policies for the profiles table
    RAISE NOTICE 'Listing all policies for profiles table:';
    FOR policy_record IN (
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual as using_expression,
            with_check as with_check_expression
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname
    ) LOOP
        RAISE NOTICE 'Policy: %', policy_record.policyname;
        RAISE NOTICE '  Operation: %', policy_record.cmd;
        RAISE NOTICE '  Roles: %', policy_record.roles;
        RAISE NOTICE '  Using expression: %', policy_record.using_expression;
        RAISE NOTICE '  With check expression: %', policy_record.with_check_expression;
        RAISE NOTICE '';
    END LOOP;

    -- Check for specific update policies for editors and users
    RAISE NOTICE 'Update policies for editors and users:';
    FOR policy_record IN (
        SELECT 
            roles,
            COUNT(*) as policy_count,
            STRING_AGG(policyname, ', ') as policy_names
        FROM pg_policies 
        WHERE tablename = 'profiles'
            AND cmd = 'UPDATE'
        GROUP BY roles
    ) LOOP
        RAISE NOTICE 'Roles: %', policy_record.roles;
        RAISE NOTICE '  Policy count: %', policy_record.policy_count;
        RAISE NOTICE '  Policy names: %', policy_record.policy_names;
        RAISE NOTICE '';
    END LOOP;

    -- Check if there's any update policy that allows users to edit their own data
    SELECT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles'
        AND cmd = 'UPDATE'
        AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
    ) INTO has_update_policy;

    RAISE NOTICE 'Has policy for users to edit their own data: %', has_update_policy;

    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '=== Summary ===';
    RAISE NOTICE 'Total policies: %', policy_count;
    RAISE NOTICE 'Self-edit policy exists: %', has_update_policy;
    
    -- Check specific conditions
    IF has_update_policy THEN
        RAISE NOTICE 'Users can edit their own profile data';
    ELSE
        RAISE NOTICE 'WARNING: No policy found allowing users to edit their own profile data';
    END IF;

END $$;
