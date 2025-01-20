import { adminSupabase } from '../config/supabase';

const createAdminUser = async () => {
  try {
    // First check if user exists
    const { data: existingUsers, error: checkError } = await adminSupabase
      .from('user_management')
      .select('*')
      .eq('email', 'p.jaworski@me.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUsers) {
      console.log('User already exists, updating role...');
      
      // Update user's role in user_management
      const { error: updateError } = await adminSupabase
        .from('user_management')
        .update({
          role: 'admin',
          is_active: true
        })
        .eq('email', 'p.jaworski@me.com');

      if (updateError) throw updateError;

      console.log('User role updated successfully');
      process.exit(0);
      return;
    }

    // Create auth user through REST API
    const response = await fetch(`${adminSupabase.supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminSupabase.supabaseKey}`,
        'apikey': adminSupabase.supabaseKey
      },
      body: JSON.stringify({
        email: 'p.jaworski@me.com',
        password: 'PZaj)!001zaj',
        email_confirm: true,
        user_metadata: {},
        app_metadata: {
          role: 'admin'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${await response.text()}`);
    }

    const userData = await response.json();
    console.log('User created successfully:', userData.id);

    // Create user management record
    const { error: managementError } = await adminSupabase
      .from('user_management')
      .insert([
        {
          user_id: userData.id,
          email: 'p.jaworski@me.com',
          role: 'admin',
          is_active: true
        }
      ]);

    if (managementError) throw managementError;

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();