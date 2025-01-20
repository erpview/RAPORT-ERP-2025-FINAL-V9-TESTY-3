# Backup and Restore Instructions

## Creating a Backup

1. Navigate to your project directory:
   ```bash
   cd /Users/erpview/Downloads/BOLT-KALKULATOR-ERP-PORÓWNYWARKA-NIEUSUWAĆ/RAPORT-ERP-2025-VER4/project
   ```

2. Run the backup script:
   ```bash
   ./scripts/backup.sh
   ```
   This will create a backup file in the `backups` directory with a timestamp, for example:
   `backups/backup_20241203_140156.tar.gz`

## Restoring to a New Location with New Supabase Project

### Step 1: Create New Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Organization: Your organization
   - Name: Your project name
   - Database Password: Set a secure password
   - Region: Choose closest to your users
   - Pricing Plan: Select appropriate plan

### Step 2: Collect New Project Credentials
Collect the following credentials from your new Supabase project:

1. Project URL:
   - Go to Settings > API
   - Copy "Project URL"

2. Anon Key:
   - Go to Settings > API
   - Copy "anon public" key

3. Service Role Key:
   - Go to Settings > API
   - Copy "service_role secret" key

4. Project ID:
   - Go to Settings > General
   - Copy "Reference ID"

5. Access Token:
   - Click your profile icon
   - Go to 'Account Settings'
   - Click 'Access Tokens'
   - Click 'Generate New Token'
   - Give it a name (e.g., "Backup Token")
   - Copy the generated token (starts with 'sbp_')

### Step 3: Create New Project Directory
```bash
mkdir -p /path/to/your/new-project  -> /Users/erpview/Downloads/new-project
```
Replace `/path/to/your/new-project` with your desired location

### Step 4: Run Restore Script
```bash
./scripts/restore-advanced.sh \
  -d /path/to/your/new-project \
  -n \
  -p your_new_project_id \
  -u https://your-new-project.supabase.co \
  -k your_new_anon_key \
  -s your_new_service_role_key \
  -t your_new_access_token \
  backups/backup_20241203_140156.tar.gz
```

Replace these values with your new project credentials:
- `/path/to/your/new-project`: New project directory path
- `your_new_project_id`: Project ID from Step 2.4
- `your-new-project.supabase.co`: Project URL from Step 2.1
- `your_new_anon_key`: Anon Key from Step 2.2
- `your_new_service_role_key`: Service Role Key from Step 2.3
- `your_new_access_token`: Access Token from Step 2.5
- Update the backup filename to match your actual backup file

### Step 5: Verify the Restore

1. Navigate to new project directory:
   ```bash
   cd /path/to/your/new-project
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Check Supabase Dashboard:
   - Verify database tables are present
   - Check authentication settings
   - Test user authentication flows

## Troubleshooting

If you encounter any issues:

1. Check the .env file in your new project directory has correct credentials
2. Verify all Supabase credentials are correctly copied
3. Ensure the database backup was successful
4. Check the console for any error messages

## Important Notes

- Keep your backup files secure as they contain sensitive information
- Never commit backup files to version control
- Regularly create new backups before major changes
- Store Access Tokens securely
- Update any external service configurations that might be pointing to the old Supabase project

## Example Command with Placeholder Values

```bash
./scripts/restore-advanced.sh \
  -d /Users/erpview/Downloads/new-project \
  -n \
  -p "abcd1234" \
  -u "https://abcd1234.supabase.co" \
  -k "eyJhbGciOiJIUzI1NiIs..." \
  -s "eyJhbGciOiJIUzI1NiIs..." \
  -t "sbp_1234..." \
  backups/backup_20241203_140156.tar.gz
```

Remember to replace all placeholder values with your actual credentials!
