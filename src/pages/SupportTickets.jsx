import React, { useState, useEffect } from 'react';
import { LifeBuoy, MessageCircle, CheckCircle2, Clock, Send, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function SupportTickets() {
  const [activeTab, setActiveTab] = useState('open');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Assuming your FastAPI backend is running on port 8001
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (ticketId) => {
    if (!replyMessage.trim()) return;
    
    if (!window.confirm("Are you sure you want to send this reply via email?")) {
      return;
    }

    setSendingReply(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage })
      });
      if (res.ok) {
        setReplyTicketId(null);
        setReplyMessage('');
        fetchTickets(); // Refresh tickets to update status
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredTickets = tickets.filter(t => t.status === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="Support Tickets"
        subtitle="Manage user inquiries and support requests"
        icon={LifeBuoy}
      />

      <div className="flex-1 bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-4">
          <button 
            onClick={() => setActiveTab('open')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Open Tickets
          </button>
          <button 
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'resolved' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Resolved
          </button>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading tickets...</div>
            ) : filteredTickets.length > 0 ? filteredTickets.map(ticket => (
              <div key={ticket.id} className="flex flex-col p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors bg-gray-50/50 dark:bg-[#1a1a1f]/50 group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-full mt-1 ${ticket.status === 'open' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500'}`}>
                      {ticket.status === 'open' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{ticket.subject}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        From <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.user}</span> • {ticket.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 sm:min-w-[120px]">
                    <span className="text-xs text-gray-400">{ticket.date}</span>
                    {ticket.status === 'open' && replyTicketId !== ticket.id && (
                      <button 
                        onClick={() => setReplyTicketId(ticket.id)}
                        className="px-4 py-2 bg-white dark:bg-[#25252a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#2e2e34] transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Reply
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {replyTicketId === ticket.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reply to {ticket.user}</h5>
                      <button onClick={() => setReplyTicketId(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your response here... (This will be sent via email)"
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121214] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                      rows={4}
                    />
                    <div className="flex justify-end mt-3">
                      <button 
                        onClick={() => handleReplySubmit(ticket.id)}
                        disabled={sendingReply || !replyMessage.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {sendingReply ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <LifeBuoy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No {activeTab} tickets found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


