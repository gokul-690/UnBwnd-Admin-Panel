import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Star, Leaf, FileEdit, Camera, BadgeCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const iconMap = {
  Leaf: Leaf,
  FileEdit: FileEdit,
  Camera: Camera,
  BadgeCheck: BadgeCheck,
  Trophy: Trophy,
  Star: Star,
};

export default function Gamification() {
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [editingBadge, setEditingBadge] = useState(null);
  const [isCreatingBadge, setIsCreatingBadge] = useState(false);
  const [viewingEarnersBadge, setViewingEarnersBadge] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [badgesRes, usersRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/badges'),
        fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/users')
      ]);
      const badgesData = await badgesRes.json();
      const usersData = await usersRes.json();
      
      if (badgesData.badges) setBadges(badgesData.badges);
      if (usersData.users) {
        // Filter users who have at least one badge
        const usersWithBadges = usersData.users.filter(u => u.badges && u.badges.length > 0);
        setUsers(usersWithBadges);
      }
    } catch (err) {
      console.error("Failed to fetch gamification data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (badge) => {
    setIsCreatingBadge(false);
    setEditingBadge(badge);
    setEditName(badge.name);
    setEditPoints(badge.points);
    setEditDescription(badge.description);
  };

  const openCreateModal = () => {
    setIsCreatingBadge(true);
    setEditingBadge({
      id: 'new',
      color: 'bg-primary',
      lucide_icon: 'Star'
    });
    setEditName('');
    setEditPoints(0);
    setEditDescription('');
  };

  const closeModal = () => {
    setEditingBadge(null);
    setIsCreatingBadge(false);
    setViewingEarnersBadge(null);
  };

  const handleSave = async () => {
    if (!editingBadge) return;
    setIsSaving(true);
    try {
      const url = isCreatingBadge 
        ? (import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/badges' 
        : `${(import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com')}/api/admin/badges/${editingBadge.id}`;
        
      const res = await fetch(url, {
        method: isCreatingBadge ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          points: parseInt(editPoints, 10) || 0,
          description: editDescription,
        }),
      });
      if (res.ok) {
        await fetchData();
        closeModal();
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error("Save error", err);
      alert("Error saving badge");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <PageHeader
        title="Gamification & Badges"
        subtitle="Manage user reward criteria and custom badges"
        icon={Trophy}
        action={{ label: 'Create Badge', icon: Plus, onClick: openCreateModal }}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const Icon = iconMap[badge.lucide_icon] || Star;
            return (
            <div key={badge.id} className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 ${badge.color} opacity-10 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform`} />
              
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-10 h-10 ${badge.color.replace('bg-', 'text-')}`} />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {badge.points} pts
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{badge.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{badge.description || badge.criteria}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                <button onClick={() => openEditModal(badge)} className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">Edit</button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* User Badge Overview */}
      {!loading && users.length > 0 && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Badge Overview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">A detailed list of users and the badges they have earned.</p>
          </div>
          
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-[#1a1a1f]/80 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/3">Badges Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm shadow-inner">
                            {user.display_name ? user.display_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.display_name || 'Anonymous User'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {user.badges.map(b => b.name).join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Edit Modal */}
      {editingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header Area */}
            <div className={`p-6 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-transparent to-${editingBadge.color.replace('bg-', '')}/5`}>
              <div className={`p-3 rounded-2xl ${editingBadge.color} bg-opacity-10 dark:bg-opacity-20`}>
                {React.createElement(iconMap[editingBadge.lucide_icon] || Star, {
                  className: `w-8 h-8 ${editingBadge.color.replace('bg-', 'text-')}`
                })}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isCreatingBadge ? "Create Badge" : "Edit Badge"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isCreatingBadge ? "Set up a new reward badge." : "Update how users see this badge."}
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Badge Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121214] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Required Points</label>
                <input 
                  type="number" 
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121214] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121214] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button 
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-all flex justify-center items-center ${
                  isSaving 
                    ? 'bg-primary/70 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25'
                }`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isCreatingBadge ? "Create Badge" : "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earners Modal */}
      {viewingEarnersBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1A1D] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className={`p-6 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-transparent to-${viewingEarnersBadge.color.replace('bg-', '')}/5`}>
              <div className={`p-3 rounded-2xl ${viewingEarnersBadge.color} bg-opacity-10 dark:bg-opacity-20`}>
                {React.createElement(iconMap[viewingEarnersBadge.lucide_icon] || Star, {
                  className: `w-8 h-8 ${viewingEarnersBadge.color.replace('bg-', 'text-')}`
                })}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Badge Earners
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Users who earned "{viewingEarnersBadge.name}"
                </p>
              </div>
            </div>

            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {(!viewingEarnersBadge.earned_by || viewingEarnersBadge.earned_by.length === 0) ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No users have earned this badge yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {viewingEarnersBadge.earned_by.map((user, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-sm shadow-inner">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={closeModal}
                className="w-full py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


