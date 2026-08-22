import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, Activity, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchData = (tab = activeTab) => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/reviews?status=${tab}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { 
        if (data.ok) setReviews(data.reviews); 
        setIsLoading(false); 
      })
      .catch(err => { 
        console.error(err); 
        setIsLoading(false); 
      });
  };

  useEffect(() => {
    fetchData(activeTab);
    const interval = setInterval(() => fetchData(activeTab), 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleAction = async (id, action) => {
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reviews/${id}/${action}`, { method: 'PUT' });
      if (res.ok) {
        setReviews(r => r.filter(x => x.id !== id));
      }
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} review.`);
    }
    setProcessing(p => { const n = { ...p }; delete n[id]; return n; });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Review Moderation"
        subtitle="Manage user-submitted reviews to maintain community standards"
        icon={MessageSquareWarning}
        iconColor="text-primary"
        badge={activeTab === 'pending' ? { count: reviews.length, label: 'pending' } : null}
      />

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white dark:bg-[#121214] rounded-xl border border-gray-100 dark:border-gray-800 w-full sm:w-fit">
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && reviews.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className={`bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 ${processing[rev.id] ? 'opacity-50 scale-95' : ''}`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate mb-2">{rev.place_name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {(rev.author || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{rev.author || 'Anonymous'}</span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <MessageSquare className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
              </div>

              {/* Comment Body */}
              <div className="flex-1 mb-4">
                <div className="relative">
                  <div className={`absolute top-0 left-0 w-0.5 h-full rounded-l-full ${
                    rev.status === 'approved' ? 'bg-green-500' : 
                    rev.status === 'rejected' ? 'bg-red-500' : 'bg-primary/30'
                  }`} />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#1a1a1f] p-4 pl-5 rounded-xl border border-gray-100 dark:border-gray-800 italic">
                    "{rev.comment}"
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                {activeTab !== 'rejected' && (
                  <button
                    onClick={() => setConfirmAction({ id: rev.id, action: 'reject' })}
                    disabled={processing[rev.id]}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 rounded-xl transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
                
                {activeTab !== 'approved' && (
                  <button
                    onClick={() => setConfirmAction({ id: rev.id, action: 'approve' })}
                    disabled={processing[rev.id]}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 rounded-xl transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
              </div>
            </div>
          ))}

          {reviews.length === 0 && !isLoading && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white dark:bg-[#121214] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inbox Zero!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeTab === 'pending' ? 'No new reviews to moderate.' : `No ${activeTab} reviews found.`}
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            handleAction(confirmAction.id, confirmAction.action);
          }
        }}
        title={`Confirm ${confirmAction?.action === 'approve' ? 'Approval' : 'Rejection'}`}
        message={`Are you sure you want to ${confirmAction?.action} this review?`}
        confirmText={`Yes, ${confirmAction?.action}`}
      />
    </div>
  );
}


