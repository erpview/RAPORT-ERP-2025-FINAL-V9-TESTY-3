import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, UserCog, Edit2, FileText } from 'lucide-react';
import { supabase, adminSupabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { UserRoleBadge } from '../components/UserRoleBadge';
import { ComparisonReportModal } from '../components/ComparisonReportModal';
import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/email';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  is_active: boolean;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  user_id: string;
  can_view_users?: boolean;
  profiles?: {
    company_name: string;
    nip: string;
    phone_number: string;
    industry: string;
    full_name: string;
    company_size: string;
    position: string;
  };
  // Flattened profile fields
  company_name: string;
  nip: string;
  phone_number: string;
  industry: string;
  full_name: string;
  company_size: string;
  position: string;
}

interface UserWithProfiles {
  email: string;
  profiles: {
    company_name: string;
    nip: string;
    phone_number: string;
    industry: string;
    full_name: string;
    company_size: string;
    position: string;
  } | null;
}

const formatApprovalEmailTemplate = (email: string) => {
  // Implement email template formatting logic here
  return {
    to_email: email,
    // Add other template parameters as needed
  };
};

const formatApprovalDetailsEmailTemplate = ({
  email,
  fullName,
  companyName,
  nip,
  companySize,
  industry,
  phoneNumber,
  position,
}: {
  email: string;
  fullName: string;
  companyName: string;
  nip: string;
  companySize: string;
  industry: string;
  phoneNumber: string;
  position: string;
}) => {
  // Implement email template formatting logic here
  return {
    to_email: email,
    full_name: fullName,
    company_name: companyName,
    nip,
    company_size: companySize,
    industry,
    phone_number: phoneNumber,
    position,
    // Add other template parameters as needed
  };
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showComparisonReport, setShowComparisonReport] = useState(false);
  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_management')
        .select(`
          *,
          profiles (
            company_name,
            nip,
            phone_number,
            industry,
            full_name,
            company_size,
            position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include profile information
      const transformedData = data?.map(user => ({
        ...user,
        company_name: user.profiles?.company_name || user.company_name || '',
        nip: user.profiles?.nip || user.nip || '',
        phone_number: user.profiles?.phone_number || user.phone_number || '',
        industry: user.profiles?.industry || user.industry || '',
        full_name: user.profiles?.full_name || user.full_name || '',
        company_size: user.profiles?.company_size || user.company_size || '',
        position: user.profiles?.position || user.position || ''
      }));
      
      // Separate pending and active users
      const pending = transformedData?.filter(user => user.status === 'pending') || [];
      const active = transformedData?.filter(user => user.status !== 'pending') || [];
      
      setPendingUsers(pending);
      setUsers(active);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Nie udało się załadować użytkowników');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      return;
    }

    try {
      // First deactivate the user in user_management
      const { error: deactivateError } = await supabase
        .from('user_management')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (deactivateError) throw deactivateError;

      // Then delete the user management record
      const { error: deleteManagementError } = await supabase
        .from('user_management')
        .delete()
        .eq('user_id', userId);

      if (deleteManagementError) throw deleteManagementError;

      // Delete user from Supabase Auth using admin client
      const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(
        userId
      );

      if (deleteAuthError) {
        console.error('Error deleting user from Auth:', deleteAuthError);
        toast.error('Użytkownik został usunięty z systemu, ale wystąpił błąd przy usuwaniu konta');
        await loadUsers();
        return;
      }

      toast.success('Użytkownik został całkowicie usunięty');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Nie udało się usunąć użytkownika');
      await loadUsers();
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      // First update user status
      const { error } = await supabase
        .from('user_management')
        .update({ 
          status: 'active',
          is_active: true 
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Get user's data including profile information
      const { data: userData, error: userError } = await supabase
        .from('user_management')
        .select(`
          email,
          role,
          profiles (
            company_name,
            nip,
            phone_number,
            industry,
            full_name,
            company_size,
            position
          )
        `)
        .eq('user_id', userId)
        .single<UserWithProfiles & { role: string }>();

      if (userError) throw userError;

      // Send first approval email (simple notification)
      try {
        const simpleTemplateParams = formatApprovalEmailTemplate(userData.email);
        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.approvalTemplateId,
          simpleTemplateParams,
          emailConfig.publicKey
        );
      } catch (emailError) {
        console.error('Error sending simple approval email:', emailError);
      }

      // Send second approval email (detailed) only for users with 'user' role
      if (userData.role === 'user') {
        try {
          const detailedTemplateParams = formatApprovalDetailsEmailTemplate({
            email: userData.email,
            fullName: userData.profiles?.full_name || '',
            companyName: userData.profiles?.company_name || '',
            nip: userData.profiles?.nip || '',
            companySize: userData.profiles?.company_size || '',
            industry: userData.profiles?.industry || '',
            phoneNumber: userData.profiles?.phone_number || '',
            position: userData.profiles?.position || ''
          });
          
          await emailjs.send(
            emailConfig.serviceId,
            emailConfig.approvalDetailsTemplateId,
            detailedTemplateParams,
            emailConfig.publicKey
          );
        } catch (emailError) {
          console.error('Error sending detailed approval email:', emailError);
        }
      }

      toast.success('Użytkownik został zatwierdzony');
      await loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Nie udało się zatwierdzić użytkownika');
    }
  };

  const handlePromoteToEditor = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_management')
        .update({ role: 'editor' })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Użytkownik został awansowany na edytora');
      await loadUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Nie udało się awansować użytkownika');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8 text-[#2c3b67]" />
            <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
              Lista użytkowników
            </h1>
            <button
              onClick={() => setShowComparisonReport(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Zobacz raporty porównań
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="sf-button-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj użytkownika
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-[#86868b]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[17px]">Ładowanie użytkowników...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending Users Section */}
            {pendingUsers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">
                  Oczekujący na zatwierdzenie
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="sf-card p-6 hover:shadow-md transition-shadow border-l-4 border-yellow-400"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-2 flex-grow">
                          <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                            {user.email}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.full_name && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">Imię i nazwisko:</span> {user.full_name}
                              </p>
                            )}
                            {user.company_name && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">Firma:</span> {user.company_name}
                              </p>
                            )}
                            {user.nip && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">NIP:</span> {user.nip}
                              </p>
                            )}
                            {user.phone_number && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">Telefon:</span> {user.phone_number}
                              </p>
                            )}
                            {user.industry && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">Branża:</span> {user.industry}
                              </p>
                            )}
                            {user.company_size && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">Wielkość firmy:</span> {user.company_size}
                              </p>
                            )}
                            {user.position && (
                              <p className="text-[15px] text-[#86868b]">
                                <span className="font-medium">Stanowisko:</span> {user.position}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(user.user_id)}
                            className="sf-button-primary text-sm"
                          >
                            Zatwierdź
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="sf-button-secondary text-sm"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edytuj
                          </button>
                          <button
                            onClick={() => handleDelete(user.user_id)}
                            className="sf-button-danger text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Users Section */}
            {users.length === 0 ? (
              <div className="sf-card p-8 text-center">
                <AlertCircle className="w-8 h-8 text-[#86868b] mx-auto mb-4" />
                <p className="text-[17px] text-[#86868b]">
                  Brak aktywnych użytkowników w systemie
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`sf-card p-6 hover:shadow-md transition-shadow ${
                      !user.is_active || user.status === 'inactive' ? 'border-l-4 border-red-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                            {user.email}
                          </h3>
                          <UserRoleBadge role={user.role} />
                          {(!user.is_active || user.status === 'inactive') && (
                            <span className="px-2 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md">
                              Nieaktywny
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {user.full_name && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">Imię i nazwisko:</span> {user.full_name}
                            </p>
                          )}
                          {user.company_name && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">Firma:</span> {user.company_name}
                            </p>
                          )}
                          {user.nip && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">NIP:</span> {user.nip}
                            </p>
                          )}
                          {user.phone_number && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">Telefon:</span> {user.phone_number}
                            </p>
                          )}
                          {user.industry && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">Branża:</span> {user.industry}
                            </p>
                          )}
                          {user.company_size && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">Wielkość firmy:</span> {user.company_size}
                            </p>
                          )}
                          {user.position && (
                            <p className="text-[15px] text-[#86868b]">
                              <span className="font-medium">Stanowisko:</span> {user.position}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.user_id !== currentUser?.id && (
                          <>
                            {user.role === 'user' && (
                              <button
                                onClick={() => handlePromoteToEditor(user.user_id)}
                                className="sf-button-primary text-sm"
                              >
                                Awansuj na edytora
                              </button>
                            )}
                            <button
                              onClick={() => setEditingUser(user)}
                              className="sf-button-secondary text-sm"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edytuj
                            </button>
                            <button
                              onClick={() => handleDelete(user.user_id)}
                              className="sf-button-danger text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Usuń
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {isCreating && (
          <CreateUserModal
            onClose={() => setIsCreating(false)}
            onSuccess={loadUsers}
          />
        )}
        
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUserUpdated={loadUsers}
          />
        )}
        <ComparisonReportModal 
          isOpen={showComparisonReport}
          onClose={() => setShowComparisonReport(false)}
        />
      </div>
    </div>
  );
};