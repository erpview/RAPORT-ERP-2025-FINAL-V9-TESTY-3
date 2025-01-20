## Migration Guide: Supabase Project Update

This guide outlines the process for migrating to a new Supabase project instance.

### Prerequisites

- Access to Supabase dashboard
- Admin privileges for both old and new projects
- PostgreSQL client (optional, for direct database access)

### Step 1: Update Configuration

1. Update `src/config/supabase.ts` with new credentials:
```typescript
const supabaseUrl = 'https://casvylqsodtkidiqbazl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 2: Database Schema Migration

1. Execute the migration script in Supabase SQL Editor:
   - Open `src/scripts/migration.sql`
   - Copy entire contents
   - Run in SQL Editor
   - This creates:
     - `systems` table
     - `user_roles` table
     - Required indexes
     - RLS policies
     - Admin check functions

2. Create admin role function:
   - Open `src/scripts/grant-admin.sql`
   - Run in SQL Editor
   - This creates the `auth.grant_admin_role` function

### Step 3: Set Up Admin User

1. Create your admin user through Supabase Authentication
2. Get the user's UUID from Authentication > Users
3. Execute admin grant:
```sql
select auth.grant_admin_role('YOUR-UUID-HERE');
```

### Step 4: Data Migration

1. Export data from old project (if needed):
```sql
copy systems to '/tmp/systems.csv' csv header;
```

2. Import data to new project:
```sql
copy systems from '/tmp/systems.csv' csv header;
```

### Key Changes

- Updated Supabase configuration
- Enhanced RLS policies
- Improved admin role management
- Added `is_active` flag for role management
- Optimized database indexes

### Dependencies

No new dependencies were added. Existing dependencies:
```json
{
  "@supabase/auth-ui-react": "^0.4.7",
  "@supabase/auth-ui-shared": "^0.1.8",
  "@supabase/supabase-js": "^2.39.3"
}
```

### Testing Procedures

1. Authentication:
   - Test login functionality
   - Verify admin access
   - Check role-based permissions

2. Systems Management:
   - Verify CRUD operations for admin users
   - Confirm read-only access for non-admin users
   - Test system comparison functionality

3. Data Integrity:
   - Verify all system fields are correctly migrated
   - Check indexes are working (monitor query performance)
   - Test RLS policies are enforcing correct access

### Rollback Instructions

1. Revert Supabase Configuration:
```typescript
// Restore previous credentials in src/config/supabase.ts
const supabaseUrl = 'YOUR_OLD_URL';
const supabaseKey = 'YOUR_OLD_KEY';
```

2. Database Rollback:
```sql
-- Drop new tables and functions
drop table if exists systems cascade;
drop table if exists user_roles cascade;
drop function if exists auth.is_admin cascade;
drop function if exists auth.grant_admin_role cascade;
```

3. Restore Data:
- If you created a backup, restore it using:
```sql
copy systems from '/path/to/backup.csv' csv header;
```

### Known Issues & Solutions

1. Infinite Recursion in Policies:
   - Issue: Circular dependency in RLS policies
   - Solution: Updated policy structure to use `auth.is_admin` function

2. Missing User Roles:
   - Issue: Admin access not working after migration
   - Solution: Re-run admin grant function with correct UUID

3. Table Drop Errors:
   - Issue: Cannot drop tables due to dependencies
   - Solution: Use CASCADE when dropping tables/policies

### Monitoring & Maintenance

1. Monitor Supabase Dashboard for:
   - Authentication success rates
   - Database performance metrics
   - Error rates and types

2. Regular checks:
   - Verify admin access is working
   - Check RLS policies are enforcing correctly
   - Monitor database size and performance

### Support

For issues or questions:
1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Contact system administrator

### Security Notes

- Keep Supabase credentials secure
- Regularly rotate admin credentials
- Monitor authentication logs
- Review RLS policies periodically