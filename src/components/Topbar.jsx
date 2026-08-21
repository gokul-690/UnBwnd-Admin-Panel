import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Moon, Sun, Users, MapPin, MessageSquare, Shield, X, CheckCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

const pathNames = {
  '/': 'Dashboard Overview',
  '/users': 'User Accounts',
  '/locations': 'Places Directory',
  '/accessibility': 'Accessibility Audits',
  '/reviews': 'Review Moderation',
  '/contributions': 'Top Contributors',
  '/reports': 'User Experience Reports',
  '/analytics': 'Usage Analytics',
  '/audit': 'System Audit Logs',
  '/audited-places': 'Audited Places',
  '/support': 'Support Tickets',
  '/notifications': 'Push Notifications',
  '/gamification': 'Gamification & Badges',
  '/admin-roles': 'Admin Roles & Permissions',
  '/export': 'Data Export Hub',
  '/settings': 'Settings',
};

const TYPE_META = {
  new_user:  { icon: Users,          color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  new_audit: { icon: Shield,         color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  new_review:{ icon: MessageSquare,  color: 'text-emerald-500',bg: 'bg-emerald-500/10' },
  new_place: { icon: MapPin,         color: 'text-primary',    bg: 'bg-primary/10' },
};

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Topbar({ setSidebarOpen }) {
  const location = useLocation();
  const currentTitle = pathNames[location.pathname] || 'Admin Portal';
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setIsOpen(v => !v);
  };

  const handleNotificationClick = (id) => {
    markOneRead(id);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800/60 sticky top-0 z-30 bg-white/90 dark:bg-[#0f0f11]/90 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-2">
        <button 
          onClick={() => setSidebarOpen && setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-white transition-colors shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate leading-tight">
            {currentTitle}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block truncate">Manage application data, moderation, and users</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-primary/10"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            title="Notifications"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 ring-2 ring-white dark:ring-[#0f0f11] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-3 w-[380px] bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark All as Read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">All caught up!</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications in the last 24 hours.</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map((n) => {
                    const meta = TYPE_META[n.type] || TYPE_META.new_user;
                    const IconComp = meta.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                          !n.isRead ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                        }`}
                      >
                        <div className={`mt-0.5 p-2 rounded-xl ${meta.bg} flex-shrink-0`}>
                          <IconComp className={`w-3.5 h-3.5 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Showing activity from the last 24 hours</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:shadow-lg transition-all" 
            title={currentUser?.name || "Admin"}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email || 'admin@unbwnd.com'}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                  {currentUser?.role || 'Super Admin'}
                </span>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </header>
      
      <ConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={confirmLogout} 
        title="Logout"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out"
      />
    </>
  );
}
