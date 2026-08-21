import React, { useState } from 'react';
import { Download, FileText, Users, MapPin, BarChart3 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function DataExport() {
  const [downloading, setDownloading] = useState(null);

  const exports = [
    { id: 'users', endpoint: '/api/admin/export/users', filename: 'UnBwnd_Users_Export.csv', title: 'User Data Export', description: 'Download a full list of registered users and their details.', icon: Users, type: 'CSV' },
    { id: 'places', endpoint: '/api/admin/export/places', filename: 'UnBwnd_Places_Export.csv', title: 'Places & Accessibility', description: 'Export all places and their verified accessibility features.', icon: MapPin, type: 'CSV' },
    { id: 'analytics', endpoint: '/api/admin/export/analytics', filename: 'UnBwnd_Analytics_Report.csv', title: 'Monthly Analytics Report', description: 'Generate a CSV summary of platform growth and engagement.', icon: BarChart3, type: 'CSV' },
    { id: 'audit_logs', endpoint: '/api/admin/export/audit_logs', filename: 'UnBwnd_Audit_Logs.csv', title: 'System Audit Logs', description: 'Download system audit trails for compliance.', icon: FileText, type: 'CSV' },
  ];

  const handleDownload = async (item) => {
    setDownloading(item.id);
    try {
      const response = await fetch(`https://unbwnd-backned1.onrender.com${item.endpoint}`);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("An error occurred during download.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Data Export Hub"
        subtitle="Generate and download system reports in CSV format"
        icon={Download}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exports.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <item.icon className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleDownload(item)}
              disabled={downloading === item.id}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all w-24 h-10 ${
                downloading === item.id 
                  ? 'bg-primary/70 text-white cursor-wait' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300'
              }`}
            >
              {downloading === item.id ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {item.type}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
