import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Users, TrendingUp, Key, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

let _cached_data = null;
let _cached_isLoading = true;

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const PIE_COLORS = ['url(#colorPrimary)', 'url(#colorSecondary)', 'url(#colorTertiary)'];

export default function Analytics() {
  const [data, setData] = useState(_cached_data);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  useEffect(() => { _cached_data = data; }, [data]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  useEffect(() => {
    const fetchData = () => {
      fetch(import.meta.env.VITE_API_URL + '/api/admin/analytics', { cache: 'no-store' })
        .then(res => res.json())
        .then(d => { if (d.ok) setData(d); setIsLoading(false); })
        .catch(err => { console.error(err); setIsLoading(false); });
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalGrowth = data?.growth?.reduce((sum, item) => sum + item.count, 0) || 0;
  const lastGrowthDate = data?.growth?.length > 0 ? data.growth[data.growth.length - 1] : { count: 0 };
  const prevGrowthDate = data?.growth?.length > 1 ? data.growth[data.growth.length - 2] : { count: 0 };
  const totalLogins = data?.methods?.reduce((sum, item) => sum + item.value, 0) || 0;
  const sortedMethods = data?.methods ? [...data.methods].sort((a, b) => b.value - a.value) : [];
  const topMethod = sortedMethods.length > 0 ? sortedMethods[0] : null;
  const growthChange = prevGrowthDate.count === 0 ? 100 : Math.round(((lastGrowthDate.count - prevGrowthDate.count) / prevGrowthDate.count) * 100);

  const stats = [
    { title: 'Total New Users',       value: totalGrowth.toLocaleString(),           subtitle: 'Past 30 days',      icon: Users,      trend: '+12%', trendUp: true,           color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Latest Signups',        value: lastGrowthDate.count.toLocaleString(),   subtitle: 'Most recent day',   icon: TrendingUp, trend: `${growthChange >= 0 ? '+' : ''}${growthChange}%`, trendUp: growthChange >= 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Authentications', value: totalLogins.toLocaleString(),            subtitle: 'All methods',       icon: Key,        trend: '+5%',  trendUp: true,           color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Top Auth Method',       value: topMethod ? topMethod.name.toUpperCase() : 'N/A', subtitle: topMethod ? `${Math.round((topMethod.value / totalLogins) * 100)}% of total` : '—', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <PageHeader
        title="Usage Analytics"
        subtitle="Monitor your platform's growth and user engagement"
        icon={BarChart3}
        iconColor="text-primary"
      />

      {isLoading || !data ? (
        <div className="flex h-[60vh] flex-col items-center justify-center bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800">
          <Loader />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Gathering insights...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  {stat.trend && (
                    <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                      {stat.trendUp && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value}</h4>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{stat.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">User Acquisition</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Daily new signups over the last 30 days</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">Last 30 Days</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false}
                      tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}`; }} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(26,26,31,0.95)', border: '1px solid #2e303a', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#e5e7eb', fontWeight: 500 }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="count" name="Signups" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Auth Methods</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Distribution of logins</p>
              </div>
              <div className="flex-1 min-h-[280px] w-full mt-4 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="colorSecondary" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="colorTertiary" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <Pie data={data.methods} cx="50%" cy="50%" innerRadius={72} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                      {data.methods.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(26,26,31,0.95)', border: '1px solid #2e303a', borderRadius: '12px', color: '#fff' }}
                      formatter={(value, name) => [value, name.toUpperCase()]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {data.methods.length > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalLogins}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Logins</span>
                  </div>
                )}
                {data.methods.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 absolute">No authentication logs found.</p>
                )}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {data.methods.map((method, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ background: idx === 0 ? 'linear-gradient(135deg,#8b5cf6,#6366f1)' : idx === 1 ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#10b981,#34d399)' }} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{method.name}</span>
                    <span className="text-xs text-gray-400">({Math.round((method.value / totalLogins) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

