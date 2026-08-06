import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, MessageSquare, Tag, TrendingDown, Clock } from 'lucide-react';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'price_alert' | 'general' | 'order' | 'message' | 'offer' | 'approval';
  isRead: boolean;
  createdAt: string;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
  unreadCount: number;
  onRefreshUnread: () => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  darkMode,
  setView,
  unreadCount,
  onRefreshUnread
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/alerts/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        onRefreshUnread();
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/alerts/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        onRefreshUnread();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/alerts/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        onRefreshUnread();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l transition-transform ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
      }`}>
        {/* Top Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-brand-darkborder bg-brand-darkcard/80' : 'border-brand-clay bg-brand-sand'
        }`}>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-sage animate-bounce" />
            <h3 className="font-bold text-base font-serif">Notifications & Alerts</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-brand-sage font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-brand-clay/20 text-brand-earth cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-brand-earth">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-brand-earth space-y-2">
              <Bell className="w-10 h-10 text-brand-sage/30 mx-auto" />
              <p className="text-sm font-medium">No new notifications.</p>
              <p className="text-xs">Price target triggers and chat alerts will appear here.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) handleMarkAsRead(notif.id);
                  if (notif.type === 'message' || notif.type === 'offer') setView('chat');
                  else if (notif.type === 'price_alert') setView('browse');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !notif.isRead
                    ? darkMode ? 'bg-brand-darkborder/60 border-brand-sage/40' : 'bg-brand-sand/70 border-brand-sage/40'
                    : darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder opacity-75' : 'bg-white border-brand-clay'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notif.type === 'price_alert' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
                    {notif.type === 'message' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                    {notif.type === 'offer' && <Tag className="w-4 h-4 text-amber-500" />}
                    <h4 className="font-bold text-xs">{notif.title}</h4>
                  </div>
                  <span className="text-[9px] text-brand-earth flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-brand-earth mt-1 leading-relaxed">{notif.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-center text-[10px] text-brand-earth ${
          darkMode ? 'border-brand-darkborder' : 'border-brand-clay'
        }`}>
          TreeMarket AI India Alert Dispatcher
        </div>
      </div>
    </div>
  );
}
