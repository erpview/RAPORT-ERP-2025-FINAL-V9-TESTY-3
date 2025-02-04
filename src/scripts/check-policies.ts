import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yixoimxvellrfrnqfwms.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableInfo() {
  try {
    // Check user_management table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_management')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error accessing user_management table:', tableError);
      return;
    }

    console.log('Successfully accessed user_management table');
    console.log('Table structure:', tableInfo);

    // Try to create a test user to check permissions
    const testUser = {
      user_id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      role: 'user',
      is_active: true
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_management')
      .insert([testUser])
      .select();

    if (insertError) {
      console.log('Insert permission check:', insertError.message);
    } else {
      console.log('Successfully inserted test user');
      
      // Clean up test user
      await supabase
        .from('user_management')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableInfo();
