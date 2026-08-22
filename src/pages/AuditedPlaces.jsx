import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Image as ImageIcon, Activity, RotateCcw, MapPin, MoreVertical, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';

let _cached_audits = [];
let _cached_searchTerm = '';
let _cached_isLoading = true;

export default function AuditedPlaces() {
  const [audits, setAudits] = useState(_cached_audits);
  const [searchTerm, setSearchTerm] = useState(_cached_searchTerm);
  const [isLoading, setIsLoading] = useState(_cached_isLoading);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [viewingAnalysis, setViewingAnalysis] = useState(null);
  const [auditToRevoke, setAuditToRevoke] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest('.dropdown-container')) setOpenDropdownId(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => { _cached_audits = audits; }, [audits]);
  useEffect(() => { _cached_searchTerm = searchTerm; }, [searchTerm]);
  useEffect(() => { _cached_isLoading = isLoading; }, [isLoading]);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com') + '/api/admin/audited-places', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { if (data.ok) setAudits(data.audits); setIsLoading(false); })
      .catch(err => { console.error('Failed to fetch audits:', err); setIsLoading(false); });
  }, []);

  const filteredAudits = audits.filter(a =>
    a.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.auditedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRevoke = async (audit) => {
    const original = [...audits];
    setAudits(audits.filter(a => a.real_id !== audit.real_id));
    try {
      await fetch(`${(import.meta.env.VITE_API_URL || 'https://unbwnd-backend1.onrender.com')}/api/admin/audited-places/${audit.real_id}/revoke`, { method: 'DELETE' });
    } catch (e) { console.error(e); setAudits(original); }
  };

  const STATUS_STYLE = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    Rejected:  'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    Pending:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Audited Places"
        subtitle="Review and verify locations audited by users"
        icon={ClipboardCheck}
        iconColor="text-primary"
        badge={{ count: filteredAudits.length, label: 'records' }}
      >
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search places or users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
          />
        </div>
      </PageHeader>

      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1a1a1f] border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Place</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Audited By</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredAudits.map(audit => (
                  <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{audit.placeName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">ID: {audit.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                          {(audit.auditedBy || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{audit.auditedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {audit.images.length > 0 ? (
                        <div className="flex -space-x-2">
                          {audit.images.slice(0, 3).map((img, i) => (
                            <img key={i} onClick={() => setSelectedImage(img)}
                              className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#121214] object-cover cursor-pointer hover:ring-primary transition-all"
                              src={img} alt="Audit" />
                          ))}
                          {audit.images.length > 3 && (
                            <div onClick={() => setSelectedImage(audit.images[0])}
                              className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#121214] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-500 cursor-pointer">
                              +{audit.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <ImageIcon className="w-4 h-4" /> No images
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{audit.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end relative dropdown-container">
                        <button onClick={e => { e.stopPropagation(); setOpenDropdownId(openDropdownId === audit.id ? null : audit.id); }}
                          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdownId === audit.id && (
                          <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#1a1a1f] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 py-2">
                            <button onClick={() => { setOpenDropdownId(null); setViewingAnalysis(audit); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                              <Activity className="w-4 h-4 text-blue-500" /> View AI Analysis
                            </button>
                            <button onClick={() => { setOpenDropdownId(null); setAuditToRevoke(audit); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2">
                              <RotateCcw className="w-4 h-4" /> Revoke Audit
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAudits.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <ClipboardCheck className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No audited places found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Expanded" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
          <button className="absolute top-6 right-6 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" onClick={() => setSelectedImage(null)}>
            <XCircle className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* AI Analysis Modal */}
      {viewingAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#121214] rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> AI Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Automated extraction for {viewingAnalysis.placeName}</p>
              </div>
              <button onClick={() => setViewingAnalysis(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a1f] p-4 rounded-xl border border-gray-200 dark:border-gray-800 mt-2">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {viewingAnalysis.ai_analysis || 'No AI analysis available.'}
              </pre>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setViewingAnalysis(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!auditToRevoke}
        onClose={() => setAuditToRevoke(null)}
        onConfirm={() => {
          if (auditToRevoke) {
            handleRevoke(auditToRevoke);
          }
        }}
        title="Confirm Revoke"
        message={`Are you sure you want to revoke the audit for "${auditToRevoke?.placeName}" by ${auditToRevoke?.auditedBy}? This will remove it from the system.`}
        confirmText="Yes, Revoke"
      />
    </div>
  );
}



