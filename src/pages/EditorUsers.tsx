import React, { useState, useEffect } from 'react';
import { Loader2, UserCog, FileText } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { ComparisonReportModal } from '../components/ComparisonReportModal';

interface UserData {
  user_id: string;
  email: string;
  created_at: string;
  role: string;
  is_active: boolean;
  status: string;
  company_name?: string;
  nip?: string;
  phone_number?: string;
  industry?: string;
  full_name?: string;
  company_size?: string;
  position?: string;
}

export const EditorUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserReport, setShowUserReport] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_management')
        .select(`
          user_id,
          email,
          created_at,
          role,
          is_active,
          status,
          profiles!inner(
            id,
            company_name,
            nip,
            phone_number,
            industry,
            full_name,
            company_size,
            position
          )
        `)
        .neq('role', 'editor')
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to flatten the profiles information
      const transformedData = data?.map(user => ({
        ...user,
        ...user.profiles,
      }));
      
      setUsers(transformedData || []);
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

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <UserCog className="w-8 h-8 text-[#2c3b67]" />
          <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
            Lista użytkowników
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-[#86868b]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[17px]">Ładowanie użytkowników...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="sf-card p-8 text-center">
            <p className="text-[17px] text-[#86868b]">
              Brak aktywnych użytkowników
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="sf-card p-6 hover:shadow-md transition-all relative"
              >
                <button
                  onClick={() => {
                    setSelectedUserId(user.user_id);
                    setShowUserReport(true);
                  }}
                  className="absolute top-6 right-6 flex items-center gap-2 bg-[#0066CC] hover:bg-[#0055CC] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Raport porównań
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-medium text-[#1d1d1f]">
                      {user.full_name || user.email}
                    </h3>
                    <p className="text-[15px] text-[#86868b]">
                      {user.email}
                    </p>
                    <p className="text-[13px] text-[#86868b]">
                      Zarejestrowano: {new Date(user.created_at).toISOString().split('T')[0]}
                    </p>
                  </div>
                </div>

                {(user.company_name || user.position || user.industry || user.nip || user.phone_number || user.company_size) && (
                  <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {user.company_name && (
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                            Firma
                          </p>
                          <p className="text-[15px] text-[#86868b]">
                            {user.company_name}
                          </p>
                        </div>
                      )}
                      {user.nip && (
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                            NIP
                          </p>
                          <p className="text-[15px] text-[#86868b]">
                            {user.nip}
                          </p>
                        </div>
                      )}
                      {user.phone_number && (
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                            Telefon
                          </p>
                          <p className="text-[15px] text-[#86868b]">
                            {user.phone_number}
                          </p>
                        </div>
                      )}
                      {user.position && (
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                            Stanowisko
                          </p>
                          <p className="text-[15px] text-[#86868b]">
                            {user.position}
                          </p>
                        </div>
                      )}
                      {user.industry && (
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                            Branża
                          </p>
                          <p className="text-[15px] text-[#86868b]">
                            {user.industry}
                          </p>
                        </div>
                      )}
                      {user.company_size && (
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">
                            Wielkość firmy
                          </p>
                          <p className="text-[15px] text-[#86868b]">
                            {user.company_size}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ComparisonReportModal 
        isOpen={showUserReport}
        onClose={() => {
          setShowUserReport(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId || undefined}
      />
    </div>
  );
};
