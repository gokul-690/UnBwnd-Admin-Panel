import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Ban, Shield, CheckCircle2, XCircle, Activity, Users, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';

let _cached_searchTerm = '';
let _cached_roleFilter = 'All';
let _cached_showFilterMenu = false;
let _cached_users = [];
let _cached_isLoading = true;
let _cached_error = null;

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState(_cached_searchTerm);
  const [roleFilter, setRoleFilter] = useState(_cached_roleFilter);
  const [showFilterMenu, setShowFilterMenu] = useState(_cached_showFilterMenu);
  const [users, setUsers] = useState(_cached_users);
  const [editingUser, setEditingUser] = useState(null);
  const [banningUser, setBanningUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  const [error, setError] = useState(_cached_error);

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest('.dropdown-container')) setOpenMenuId(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => { _cached_searchTerm = searchTerm; }, [searchTerm]);
  useEffect(() => { _cached_roleFilter = roleFilter; }, [roleFilter]);
  useEffect(() => { _cached_showFilterMenu = showFilterMenu; }, [showFilterMenu]);
  useEffect(() => { _cached_users = users; }, [users]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);
  useEffect(() => { _cached_error = error; }, [error]);

  const formatUsers = (data) => data.users.map(u => ({
    id: u.id,
    name: u.display_name || 'Anonymous User',
    email: u.email || u.phone || u.mobile_number || 'No contact info',
    role: u.profile_type === 'admin' ? 'Admin' : 'User',
    status: 'Active',
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown',
    lastLogin: u.last_login_at
      ? new Date(u.last_login_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Never',
    isOnline: u.last_login_at && (Date.now() - new Date(u.last_login_at).getTime()) < 10 * 60 * 1000,
  }));

  const fetchUsers = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/users', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      if (data.ok && data.users) { setUsers(formatUsers(data)); setError(null); }
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => fetchUsers(true), 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts"
        subtitle="Manage registered users, roles, and permissions"
        icon={Users}
        iconColor="text-blue-500"
        badge={{ count: users.length, label: 'users' }}
        action={{ label: 'Refresh', icon: RefreshCw, onClick: () => fetchUsers() }}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex-1 w-full sm:w-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {roleFilter !== 'All' ? roleFilter : 'Filter'}
              {roleFilter !== 'All' && <span className="w-2 h-2 rounded-full bg-primary" />}
            </button>
            {showFilterMenu && (
              <div className="absolute top-full mt-2 right-0 w-44 bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 py-2 animate-in fade-in slide-in-from-top-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                {['All', 'Admin', 'User'].map(r => (
                  <button key={r} onClick={() => { setRoleFilter(r); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${roleFilter === r ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                    {r === 'All' ? 'All Roles' : r}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{filteredUsers.length} of {users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Activity className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Error Loading Users</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
            <button onClick={() => fetchUsers()} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-black/10">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filteredUsers.map(user => (
                  <div key={user.id} className="bg-white dark:bg-[#1a1a1f] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary/40 dark:hover:border-primary/40 transition-all flex flex-col group">
                    {/* Card header with avatar and action menu */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#155E75] to-[#0e8fa8] flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:scale-105 transition-transform">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-[#1a1a1f] rounded-full" />
                        )}
                      </div>
                      <div className="relative dropdown-container">
                        <button onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === user.id ? null : user.id); }} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 py-2">
                            <button onClick={() => { setOpenMenuId(null); setEditingUser({ ...user }); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => { setOpenMenuId(null); setBanningUser(user); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2">
                              <Ban className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-4 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base truncate" title={user.name}>{user.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={user.email}>{user.email}</p>
                    </div>
                    
                    {/* Details Footer */}
                    <div className="space-y-2.5 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center text-xs bg-gray-50 dark:bg-[#121214] px-2 py-1.5 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400">Role</span>
                        <div className="flex items-center gap-1">
                          {user.role === 'Admin' && <Shield className="w-3.5 h-3.5 text-primary" />}
                          <span className={`font-semibold ${user.role === 'Admin' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{user.role}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs px-2">
                        <span className="text-gray-500 dark:text-gray-400">Joined</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{user.joined}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs px-2">
                        <span className="text-gray-500 dark:text-gray-400">Last Login</span>
                        <span className={`font-medium ${user.lastLogin === 'Never' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{user.lastLogin}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center my-10">
                <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white">No users found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && (
          <div className="px-6 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1a1a1f]/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filteredUsers.length} of {users.length} users</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-40" disabled>Previous</button>
              <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#121214] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Display Name', key: 'name', type: 'text' },
                { label: 'Email / Contact', key: 'email', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input type={type} value={editingUser[key]}
                    onChange={e => setEditingUser({ ...editingUser, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-gray-900 dark:text-white text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-gray-900 dark:text-white text-sm">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">Cancel</button>
                <button
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await fetch(`${(import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com')}/api/admin/users/${editingUser.id}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ display_name: editingUser.name, email: editingUser.email, profile_type: editingUser.role === 'Admin' ? 'admin' : 'user' }),
                      });
                      setEditingUser(null); fetchUsers();
                    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!banningUser}
        onClose={() => setBanningUser(null)}
        onConfirm={async () => {
          const id = banningUser.id;
          setBanningUser(null);
          setIsLoading(true);
          try {
            await fetch(`${(import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com')}/api/admin/users/${id}`, { method: 'DELETE' });
            fetchUsers();
          } catch (e) { 
            console.error(e); 
            setIsLoading(false);
          }
        }}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${banningUser?.name}? This will remove all their saved places and data. This action cannot be undone.`}
        confirmText="Delete User"
      />
    </div>
  );
}



