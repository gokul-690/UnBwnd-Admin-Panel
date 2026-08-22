import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, X, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

export default function AdminRoles() {
  const { token, currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Moderator' });
  const [inviteLoading, setInviteLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (token && currentUser?.role === 'Super Admin') {
      fetchAdmins();
    }
  }, [token, currentUser]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/rbac/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;
    setInviteLoading(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/rbac/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to invite user');
      }
      
      const newAdminData = await response.json();
      setAdmins([newAdminData, ...admins]);
      setIsInviteOpen(false);
      setNewAdmin({ name: '', email: '', role: 'Moderator' });
    } catch (err) {
      alert(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/rbac/users/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to delete user');
      }
      
      setAdmins(admins.filter(a => a.id !== deleteId));
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  if (currentUser?.role !== 'Super Admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <ShieldCheck className="w-16 h-16 text-red-500/50 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-center max-w-md">
          You do not have permission to view or manage admin roles. Please contact a Super Admin if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Admin Roles & Permissions"
        subtitle="Manage team access to the admin portal"
        icon={ShieldCheck}
        action={{ label: 'Invite Team Member', icon: UserPlus, onClick: () => setIsInviteOpen(true) }}
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#1a1a1f] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added On</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading team members...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No team members found.</td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.name} {admin.id === currentUser?.id ? "(You)" : ""}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      admin.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-500' :
                      admin.role === 'Moderator' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-500 dark:bg-gray-700/50 dark:text-gray-300'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{admin.date}</td>
                  <td className="px-6 py-4 text-right">
                    {admin.id !== currentUser?.id && (
                      <button 
                        onClick={() => openDeleteModal(admin.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121214] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" required 
                  value={newAdmin.name} 
                  onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="e.g. Alex Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" required 
                  value={newAdmin.email} 
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="alex@unbwnd.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select 
                  value={newAdmin.role} 
                  onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                >
                  <option value="Moderator">Moderator</option>
                  <option value="Viewer">Viewer</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInviteOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm shadow-primary/20 disabled:opacity-70">
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member? They will lose access to the admin portal immediately."
        confirmText={deleteLoading ? 'Removing...' : 'Remove'}
      />
    </div>
  );
}


