import React, { useState, useEffect } from 'react';
import { FileText, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

let _cached_reports = [];
let _cached_isLoading = true;

const formatIssue = (issueText) => {
  if (!issueText) return <span className="text-gray-400 italic">None reported</span>;
  const match = issueText.match(/^\[(.*?)\](.*)$/);
  if (match) {
    const category = match[1].replace(/_/g, ' ');
    const comment = match[2].trim();
    return (
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{category}</span>
        {comment && <span className="text-gray-500 dark:text-gray-400 text-xs">{comment}</span>}
      </div>
    );
  }
  return issueText;
};

const SATISFACTION_STYLE = {
  good:    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  average: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  bad:     'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
};

export default function Reports() {
  const [reports, setReports] = useState(_cached_reports);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  useEffect(() => { _cached_reports = reports; }, [reports]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  useEffect(() => {
    const fetchData = () => {
      fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/user-reports', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => { if (data.ok) setReports(data.reports); setIsLoading(false); })
        .catch(err => { console.error(err); setIsLoading(false); });
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredReports = reports.filter(r => {
    if (!r.created_at) return false;
    const d = new Date(r.created_at).toISOString().split('T')[0];
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="User Experience Reports"
        subtitle="Feedback and issue reports submitted by users"
        icon={FileText}
        iconColor="text-blue-500"
        badge={{ count: filteredReports.length, label: 'reports' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-[#1a1a1f] dark:text-white" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-[#1a1a1f] dark:text-white" />
          </div>
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }}
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
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Satisfaction</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issues</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredReports.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{r.destination_name || 'General App Usage'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{r.user_name || 'Anonymous'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${SATISFACTION_STYLE[r.satisfaction] || 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                        {r.satisfaction || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-[280px]">{formatIssue(r.issues)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">No reports for the selected date range.</td>
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


