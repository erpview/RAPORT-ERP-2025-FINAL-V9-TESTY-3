import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData?.session) {
          throw new Error('No session data');
        }

        const user = sessionData.session.user;
        console.log('User authenticated:', user);

        // Create or update profile first (required by foreign key constraint)
        console.log('Creating/updating profile...');
        const metadata = user.user_metadata;
        console.log('LinkedIn metadata:', metadata);
        
        // First get existing profile data to preserve values
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // For LinkedIn users, update only essential fields while preserving others
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: metadata.name || metadata.full_name || user.email || '',
          company_name: metadata.company || existingProfile?.company_name || '',
          position: metadata.position || metadata.title || existingProfile?.position || '',
          linkedin_profile_link: metadata.linkedin_url || metadata.sub || '',
          status: existingProfile?.status || 'pending',
          created_at: existingProfile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Only include ERP fields if they already exist
          ...(existingProfile?.czy_korzysta_z_erp !== undefined && { czy_korzysta_z_erp: existingProfile.czy_korzysta_z_erp }),
          ...(existingProfile?.czy_zamierza_wdrozyc_erp !== undefined && { czy_zamierza_wdrozyc_erp: existingProfile.czy_zamierza_wdrozyc_erp }),
          ...(existingProfile?.czy_dokonal_wyboru_erp !== undefined && { czy_dokonal_wyboru_erp: existingProfile.czy_dokonal_wyboru_erp })
        }, { onConflict: 'id' });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        // Create or update user in user_management after profile is created
        console.log('Creating/updating user in user_management...');
        // First try to find existing user by email
        const { data: existingUserByEmail } = await supabase
          .from('user_management')
          .select('*')
          .eq('email', user.email)
          .eq('auth_provider', 'linkedin_oidc')
          .single();

        // If found existing LinkedIn user with same email but different ID, link them
        if (existingUserByEmail && existingUserByEmail.user_id !== user.id) {
          // Update auth user ID in all related tables
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ id: user.id })
            .eq('id', existingUserByEmail.user_id);

          if (profileError) {
            console.error('Error updating profile ID:', profileError);
            throw profileError;
          }

          const { error: userError } = await supabase
            .from('user_management')
            .update({ user_id: user.id })
            .eq('user_id', existingUserByEmail.user_id);

          if (userError) {
            console.error('Error updating user ID:', userError);
            throw userError;
          }
        } else {
          // Create/update the user record if no existing LinkedIn user found
          const { error: userError } = await supabase.from('user_management').upsert({
            user_id: user.id,
            email: user.email,
            role: 'user',
            is_active: true,  // LinkedIn users are automatically active
            status: 'active', // Set status to active
            auth_provider: 'linkedin_oidc',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

          if (userError) {
            console.error('Error creating/updating user:', userError);
            throw userError;
          }
        }



        console.log('Successfully set up user');
        toast.success('Zalogowano pomyślnie');
        setIsLoading(false);
        navigate('/');
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Wystąpił błąd podczas logowania');
        setIsLoading(false);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Trwa logowanie...</p>
      </div>
    </div>
  );
}
