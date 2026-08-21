import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, MapPin, Accessibility, MessageSquareWarning, Activity, 
  FileText, BarChart, ShieldCheck, ClipboardCheck, LogOut, Settings, Bell, 
  Shield, Trophy, Download, LifeBuoy
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../context/AuthContext';

const menuGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', label: 'Dashboard Overview', path: '/', icon: LayoutDashboard },
      { name: 'Analytics', label: 'Usage Analytics', path: '/analytics', icon: BarChart },
    ]
  },
  {
    title: 'Content & Moderation',
    items: [
      { name: 'Places', label: 'Places Directory', path: '/locations', icon: MapPin },
      { name: 'Audited Places', label: 'Audited Places', path: '/audited-places', icon: ClipboardCheck },
      { name: 'Accessibility', label: 'Accessibility Audits', path: '/accessibility', icon: Accessibility },
      { name: 'Reviews', label: 'Review Moderation', path: '/reviews', icon: MessageSquareWarning },
    ]
  },
  {
    title: 'Community & Engagement',
    items: [
      { name: 'Users', label: 'User Accounts', path: '/users', icon: Users },
      { name: 'Support', label: 'Support Tickets', path: '/support', icon: LifeBuoy },
      { name: 'Reports', label: 'Experience Reports', path: '/reports', icon: FileText },
      { name: 'Notifications', label: 'Push Notifications', path: '/notifications', icon: Bell },
      { name: 'Contributions', label: 'Top Contributors', path: '/contributions', icon: Activity },
      { name: 'Gamification', label: 'Gamification & Badges', path: '/gamification', icon: Trophy },
    ]
  },
  {
    title: 'System & Admin',
    items: [
      { name: 'Admin Roles', label: 'Admin Roles', path: '/admin-roles', icon: Shield },
      { name: 'Export', label: 'Data Export Hub', path: '/export', icon: Download },
      { name: 'System Logs', label: 'System Audit Logs', path: '/audit', icon: ShieldCheck },
      { name: 'Settings', label: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`fixed lg:sticky top-0 left-0 h-screen w-64 flex flex-col bg-[#f8f9fa] dark:bg-[#09090b] border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo Area */}
      <div className="h-[72px] flex items-center px-6 border-b border-gray-200 dark:border-gray-800/60">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="UnBwnd Logo" className="w-8 h-8 object-contain rounded-lg" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white tracking-tight leading-tight">UnBwnd</span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 custom-scrollbar">
        {menuGroups.map((group, idx) => {
          const filteredItems = group.items.filter(item => {
            const role = currentUser?.role;
            
            // Super Admin sees everything
            if (role === 'Super Admin') return true;

            // Viewer restrictions
            if (role === 'Viewer') {
              const hiddenForViewers = ['Admin Roles', 'Notifications', 'Settings', 'System Logs', 'Export'];
              if (hiddenForViewers.includes(item.name)) return false;
            }

            // Moderator restrictions
            if (role === 'Moderator') {
              const hiddenForModerators = ['Admin Roles', 'System Logs', 'Settings'];
              if (hiddenForModerators.includes(item.name)) return false;
            }

            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={idx}>
              <div className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                  
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen && setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-gray-200/60 dark:bg-white/10 text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile / Bottom Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800/60">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-700">
              {currentUser?.name ? (
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{currentUser.name.charAt(0).toUpperCase()}</span>
              ) : (
                <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white leading-none">{currentUser?.name || 'Admin'}</span>
              <span className="text-[10px] text-gray-500 mt-1">{currentUser?.role || 'User'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
      <ConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={confirmLogout} 
        title="Logout"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out"
      />
    </div>
  );
}
