import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ComparisonReport {
    id: string;
    user_id: string;
    comparison_start: string;
    comparison_end: string;
    duration_seconds: number;
    systems_compared: string[];
    user_email?: string;
    system_names?: string[];
}

interface UserEmail {
    id: string;
    email: string;
}

interface System {
    id: string;
    name: string;
}

interface ComparisonReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
}

export const ComparisonReportModal: React.FC<ComparisonReportModalProps> = ({ isOpen, onClose, userId }) => {
    const [reports, setReports] = useState<ComparisonReport[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('user_comparison_report')
                .select('*')
                .order('comparison_start', { ascending: false });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data: reportsData, error: reportsError } = await query;
            if (reportsError) throw reportsError;

            const { data: userData, error: userError } = await supabase
                .from('user_emails_view')
                .select('id, email')
                .in('id', reportsData?.map(r => r.user_id) || []);

            if (userError) {
                console.error('Error fetching user emails:', userError);
            }

            const userEmailMap = new Map<string, string>();
            (userData as UserEmail[] || []).forEach((u: UserEmail) => {
                userEmailMap.set(u.id, u.email);
            });

            // Get all unique system IDs from reports
            const allSystemIds = [...new Set((reportsData || []).flatMap(r => r.systems_compared))];

            // Get system names
            const { data: systemsData, error: systemsError } = await supabase
                .from('systems')
                .select('id, name')
                .in('id', allSystemIds);

            if (systemsError) throw systemsError;

            // Create a map of system IDs to names
            const systemNameMap = new Map<string, string>();
            (systemsData as System[] || []).forEach((s: System) => {
                systemNameMap.set(s.id, s.name);
            });

            // Combine all data
            const enrichedReports = (reportsData || []).map((report: ComparisonReport) => ({
                ...report,
                user_email: userEmailMap.get(report.user_id) || 'Unknown User',
                system_names: report.systems_compared.map((id: string) => systemNameMap.get(id) || 'Unknown System')
            }));

            setReports(enrichedReports);
        } catch (error) {
            console.error('Error fetching comparison reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchReports();
        }
    }, [isOpen, userId]);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-6xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Raporty porównań systemów</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">Ładowanie...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Użytkownik
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Porównane systemy
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Czas spędzony
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {report.user_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.system_names?.join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(report.comparison_start), 'dd MMM yyyy, HH:mm', { locale: pl })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDuration(report.duration_seconds)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
