import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SessionManagement() {
    const queryClient = useQueryClient();

    // Fetch Sessions
    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await api.get('/sessions');
            return res.data;
        }
    });

    // Revoke Session Mutation
    const revokeSessionMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/sessions/${id}/revoke`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            toast.success('Session revoked successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to revoke session');
        }
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading sessions...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Session Management</h1>
                <p className="text-gray-500 mt-1">View and manage active user sessions.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">IP Address</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">User Agent</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Last Active</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sessions.map((session: any) => (
                                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {session.user?.username || 'Unknown'}
                                        <span className="block text-xs text-gray-500 font-normal">{session.user?.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{session.ipAddress}</td>
                                    <td className="px-6 py-4 text-gray-600">{session.location || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[200px]" title={session.userAgent}>
                                        {session.userAgent}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${session.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {session.isValid ? 'Active' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {format(new Date(session.lastActive), 'dd MMM yyyy, HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {session.isValid && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to revoke this session?')) {
                                                        revokeSessionMutation.mutate(session.id);
                                                    }
                                                }}
                                                disabled={revokeSessionMutation.isPending}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No sessions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
