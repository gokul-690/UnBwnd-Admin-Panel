import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIdsRef = useRef(new Set());
  const isFirstFetchRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok || !data.notifications) return;

      const incoming = data.notifications;

      if (isFirstFetchRef.current) {
        // On first load, mark everything as seen (don't notify for old events)
        incoming.forEach(n => seenIdsRef.current.add(n.id));
        setNotifications(incoming.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        isFirstFetchRef.current = false;
        return;
      }

      // Find new ones that we haven't seen before
      const newItems = incoming.filter(n => !seenIdsRef.current.has(n.id));
      if (newItems.length > 0) {
        newItems.forEach(n => seenIdsRef.current.add(n.id));
        setNotifications(prev => {
          const merged = [...newItems.map(n => ({ ...n, isRead: false })), ...prev];
          return merged.slice(0, 50);
        });
        setUnreadCount(prev => prev + newItems.length);
      }
    } catch (e) {
      // Silently fail – backend might be momentarily unavailable
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markOneRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

