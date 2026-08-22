import React, { useState, useEffect } from 'react';
import { Users, MapPin, MessageSquareWarning, FileText, ArrowUpRight, Activity, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

const COLORS = ['#aa3bff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatTitleCase(str) {
  if (!str) return '';
  return str
    .toString()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

let _cached_data = null;
let _cached_stats = null;
let _cached_isLoading = true;

export default function Dashboard() {
  const [data, setData] = useState(_cached_data);
  const [stats, setStats] = useState(_cached_stats);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  useEffect(() => { _cached_data = data; }, [data]);
  useEffect(() => { _cached_stats = stats; }, [stats]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  useEffect(() => {
    const fetchData = () => {
      Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/dashboard', { cache: 'no-store' }).then(r => r.json()),
        fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/sidebar-stats', { cache: 'no-store' }).then(r => r.json()),
      ]).then(([dashboardRes, statsRes]) => {
        if (dashboardRes.ok) setData(dashboardRes);
        if (statsRes.ok) setStats(statsRes.stats);
        setIsLoading(false);
      }).catch(err => { console.error(err); setIsLoading(false); });
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !data || !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const chartCategories = (data.categories || []).map(item => ({
    ...item,
    name: formatTitleCase(item.name),
  }));

  const statCards = [
    { title: 'Total Users',            value: stats['Users'] || 0,         icon: Users,                color: 'text-blue-500',    bg: 'bg-blue-500/10' },
    { title: 'Total Places',           value: stats['Places'] || 0,        icon: MapPin,               color: 'text-primary',     bg: 'bg-primary/10' },
    { title: 'Accessibility Reports',  value: stats['Accessibility'] || 0, icon: FileText,             color: 'text-amber-500',   bg: 'bg-amber-500/10' },
    { title: 'Total Reviews',          value: stats['Reviews'] || 0,       icon: MessageSquareWarning, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Live summary of all activity across the platform"
        icon={LayoutDashboard}
        iconColor="text-primary"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-primary transition-colors">{stat.value.toLocaleString()}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-500 gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Live Data
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Places by Category</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCategories} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={60} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #2e303a', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                  {chartCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Users</h3>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">Newest</span>
          </div>
          <div className="space-y-4 flex-1">
            {data.recent_users.map((user, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                  {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.display_name || 'Anonymous User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || 'Email not provided'}</p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {data.recent_users.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No recent users.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Places Table */}
      <div className="bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Recently Added Places</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Place Name</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.recent_places.map((place, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{formatTitleCase(place.name)}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {formatTitleCase(place.category)}
                    </span>
                  </td>
                  <td className="py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                    {new Date(place.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data.recent_places.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No recent places.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


