import React, { useState, useEffect } from 'react';
import { Accessibility, Activity, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';

let _cached_reports = [];
let _cached_isLoading = true;

const FEATURE_MAP = {
  wheelchair_accessible_entrance: '♿ Wheelchair',
  ramp_available: '🔰 Ramp',
  accessible_parking: '🅿️ Parking',
  accessible_restroom: '🚻 Restroom',
  elevator_access: '🛗 Elevator',
  braille_signage: '⠿ Braille',
  clear_signage: '🔤 Clear Signage',
  hearing_assistance_available: '🔊 Hearing Aid',
  accessible_seating: '💺 Seating',
};

export default function AccessibilityModeration() {
  const [reports, setReports] = useState(_cached_reports);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  const [dateFilter, setDateFilter] = useState('');
  useEffect(() => { _cached_reports = reports; }, [reports]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  const fetchData = () => {
    fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/accessibility-reports', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { if (data.ok) setReports(data.reports); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredReports = reports.filter(r => {
    if (!dateFilter) return true;
    if (!r.created_at) return false;
    return new Date(r.created_at).toISOString().split('T')[0] === dateFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Accessibility Audits"
        subtitle="Review and approve accessibility reports submitted by users"
        icon={Accessibility}
        iconColor="text-amber-500"
        badge={{ count: filteredReports.length, label: 'reports' }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:bg-[#1a1a1f] dark:text-white"
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
            <Activity className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1a1a1f] border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Place</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredReports.map(r => {
                  const activeFeatures = Object.entries(FEATURE_MAP).filter(([key]) => r[key]);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{r.place_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[160px]">
                        {r.reason_for_update || <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {activeFeatures.length > 0
                            ? activeFeatures.map(([, label]) => (
                                <span key={label} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 rounded-full text-[10px] font-medium">
                                  {label}
                                </span>
                              ))
                            : <span className="text-gray-400 text-xs italic">None</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                        {r.accessibility_rating ? `${r.accessibility_rating}/5 ⭐` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {r.created_at && <span className="text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                      No reports found for the selected filter.
                    </td>
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


