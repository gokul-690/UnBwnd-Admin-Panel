import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Globe, Smartphone, KeyRound, Search,
  RefreshCw, Activity, Users, LogIn, Filter, Clock
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

// ─── Helpers ────────────────────────────────────────────────────────────────

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function actionMeta(action = '') {
  const a = action.toLowerCase();
  if (a.includes('google'))   return { label: 'Google',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',         icon: Globe };
  if (a.includes('apple'))    return { label: 'Apple',    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',          icon: Smartphone };
  if (a.includes('otp'))      return { label: 'OTP',      color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',      icon: Smartphone };
  if (a.includes('password')) return { label: 'Password', color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',  icon: KeyRound };
  return { label: action,     color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: LogIn };
}

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];
function avatarColor(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Module-level cache ──────────────────────────────────────────────────────

let _cached_logs = [];
let _cached_isLoading = true;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AuditLogs() {
  const [logs, setLogs] = useState(_cached_logs);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { _cached_logs = logs; }, [logs]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('https://unbwnd-backned1.onrender.com/api/admin/audit-logs', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) { setLogs(data.logs); setLastRefreshed(new Date()); }
    } catch (err) {
      console.error('Audit log fetch failed:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(false);
    const id = setInterval(() => fetchLogs(true), 3000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = {
    total:    logs.length,
    google:   logs.filter(l => l.action?.toLowerCase().includes('google')).length,
    password: logs.filter(l => l.action?.toLowerCase().includes('password')).length,
    otp:      logs.filter(l => l.action?.toLowerCase().includes('otp') || l.action?.toLowerCase().includes('apple')).length,
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const ACTION_OPTIONS = ['All', 'Google', 'Password', 'OTP', 'Apple'];

  const filtered = logs.filter(log => {
    const name  = (log.user_name || '').toLowerCase();
    const email = (log.email || '').toLowerCase();
    const q     = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || email.includes(q);
    const matchAction =
      actionFilter === 'All' ||
      (log.action || '').toLowerCase().includes(actionFilter.toLowerCase());
    return matchSearch && matchAction;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <PageHeader
        title="System Audit Logs"
        subtitle="Authentication events, login activity, and security monitoring"
        icon={ShieldCheck}
        iconColor="text-indigo-500"
        badge={{ count: stats.total, label: 'total events' }}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Login Events"
          value={stats.total}
          icon={Activity}
          iconBg="bg-indigo-100 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Google Sign-Ins"
          value={stats.google}
          icon={Globe}
          iconBg="bg-blue-100 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Password Logins"
          value={stats.password}
          icon={KeyRound}
          iconBg="bg-violet-100 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="OTP / Apple"
          value={stats.otp}
          icon={Smartphone}
          iconBg="bg-amber-100 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1f] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
            />
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {ACTION_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setActionFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    actionFilter === opt
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Live refresh indicator */}
          <div className="sm:ml-auto flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                refreshing ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            {lastRefreshed
              ? `Updated ${relativeTime(lastRefreshed.toISOString())}`
              : 'Connecting…'}
          </div>
        </div>

        {/* Timeline View */}
        <div className="flex flex-col flex-1 min-h-[420px]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto">
              {filtered.length > 0 ? (
                <div className="relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 ml-2 space-y-6">
                  {filtered.map((log, i) => {
                    const meta = actionMeta(log.action);
                    const Icon = meta.icon;
                    return (
                      <div key={i} className="relative flex gap-6 items-start group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm ring-4 ring-white dark:ring-[#121214] ${meta.color} transition-transform group-hover:scale-110`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-[#1a1a1f] p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${meta.color}`}>
                              Login via {meta.label}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono bg-white dark:bg-[#121214] px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              {new Date(log.timestamp).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })} <span className="text-gray-300 dark:text-gray-600">|</span> {relativeTime(log.timestamp)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white dark:bg-[#121214] p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(log.user_name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-inner`}>
                              {(log.user_name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {log.user_name || 'Anonymous User'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {log.email || 'Email not available'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {search || actionFilter !== 'All'
                      ? 'No entries match your filters.'
                      : 'No login records found.'}
                  </p>
                  {(search || actionFilter !== 'All') && (
                    <button
                      onClick={() => { setSearch(''); setActionFilter('All'); }}
                      className="mt-3 text-xs text-indigo-500 hover:text-indigo-600 font-medium underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
              
              {/* Footer row count */}
              {filtered.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Showing{' '}
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span>
                    {logs.length !== filtered.length && (
                      <> of <span className="font-semibold text-gray-600 dark:text-gray-300">{logs.length}</span></>
                    )}{' '}
                    {filtered.length === 1 ? 'event' : 'events'}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 dark:bg-[#1a1a1f] px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                    <RefreshCw className="w-3 h-3 text-indigo-400" /> Auto-refreshes every 3s
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
