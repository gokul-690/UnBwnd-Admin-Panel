import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Medal, Star, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

let _cached_leaders = [];
let _cached_isLoading = true;

export default function Contributions() {
  const [leaders, setLeaders] = useState(_cached_leaders);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  const [dateFilter, setDateFilter] = useState('');
  useEffect(() => { _cached_leaders = leaders; }, [leaders]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  useEffect(() => {
    const fetchData = () => {
      fetch(import.meta.env.VITE_API_URL + '/api/admin/contributions', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => { if (data.ok) setLeaders(data.contributions); setIsLoading(false); })
        .catch(err => { console.error(err); setIsLoading(false); });
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLeaders = leaders.filter(user => {
    if (!dateFilter) return true;
    if (!user.created_at) return false;
    return new Date(user.created_at).toISOString().split('T')[0] === dateFilter;
  });

  const RANK_ICONS = [
    <Trophy className="w-5 h-5 text-yellow-500" />,
    <Medal className="w-5 h-5 text-gray-400" />,
    <Medal className="w-5 h-5 text-amber-700" />,
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Top Contributors"
        subtitle="Leaderboard of most active users by contributions"
        icon={Trophy}
        iconColor="text-yellow-500"
        badge={{ count: filteredLeaders.length, label: 'contributors' }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-[#1a1a1f] dark:text-white"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')}
              className="text-xs px-3 py-1.5 font-medium text-gray-500 hover:text-red-500 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors">
              Clear
            </button>
          )}
        </div>
      </PageHeader>

      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1a1a1f] border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Places Added</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verifications</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLeaders.map((user, i) => {
                  const places = Array.isArray(user.contributed_places) ? user.contributed_places.filter(Boolean) : [];
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8">
                          {i < 3 ? RANK_ICONS[i] : <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{i + 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                            {(user.display_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{user.display_name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-400">{user.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-primary">
                          <Star className="w-4 h-4 fill-primary" />
                          {(user.contribution_count || 0) + (user.verification_count || 0) + (user.photo_upload_count || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {places.length > 0 ? (
                          <select defaultValue="" className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-[#1a1a1f] text-gray-700 dark:text-gray-300">
                            <option value="" disabled>View Places ({places.length})</option>
                            {places.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{user.contribution_count || 0}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.verification_count || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
                {filteredLeaders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">No contributors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

