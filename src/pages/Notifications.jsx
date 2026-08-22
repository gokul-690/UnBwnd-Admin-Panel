import React, { useState } from 'react';
import { Bell, Send, Clock, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Notifications() {
  const [history, setHistory] = useState([
    { id: 1, title: 'New Accessibility Features', audience: 'All Users', status: 'Sent', date: '2026-07-08 14:30' },
    { id: 2, title: 'App Maintenance Notice', audience: 'All Users', status: 'Scheduled', date: '2026-07-10 02:00' },
  ]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('All Users');

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      alert('Please fill out both the title and message body.');
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/push-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, audience })
      });
      if (!res.ok) throw new Error('Failed to send push notification');
    } catch (e) {
      alert(e.message);
      return;
    }

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newNotification = {
      id: Date.now(),
      title,
      audience,
      status: 'Sent',
      date: dateStr,
    };

    // Add to top of history
    setHistory([newNotification, ...history]);
    
    // Clear form
    setTitle('');
    setBody('');
    setAudience('All Users');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Push Notifications"
        subtitle="Compose and manage push notifications to mobile users"
        icon={Bell}
        action={{ label: 'Send Notification', icon: Send, onClick: handleSend }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Compose Notification</h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                type="text" 
                placeholder="e.g., Check out our new features!" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Body</label>
              <textarea 
                rows="4" 
                placeholder="Type your message here..." 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
              <select 
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white appearance-none"
              >
                <option>All Users</option>
                <option>Active Contributors</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
             <button
               onClick={handleSend}
               className="flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm shadow-primary/20"
             >
               <Send className="w-4 h-4" />
               Send Notification
             </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Notification History</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {history.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1f]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {item.audience}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

