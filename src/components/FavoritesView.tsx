import React, { useState, useEffect } from 'react';
import { 
  Heart, MapPin, Calendar, AlertCircle, Sparkles, ArrowRight, 
  Bell, Plus, Trash2, Check, CheckCheck, TrendingDown, Info, 
  ChevronRight, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { Tree } from '../types';

interface PriceAlert {
  id: string;
  userId: string;
  speciesName: string;
  region: string;
  targetPrice: number;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'price_alert' | 'general' | 'order';
  isRead: boolean;
  createdAt: string;
}

interface FavoritesViewProps {
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
  favorites: Tree[];
  toggleFavorite: (treeId: string) => Promise<void>;
  loading: boolean;
}

const AVAILABLE_SPECIES = [
  "Teak (Sagwan)",
  "Sandalwood",
  "Shisham",
  "Eucalyptus",
  "Bamboo",
  "Mango",
  "Mahogany",
  "Rosewood",
  "Poplar",
  "Neem"
];

const REGIONS = [
  "All India",
  "Karnataka",
  "Punjab",
  "Maharashtra",
  "Uttar Pradesh",
  "Haryana",
  "Gujarat",
  "Tamil Nadu",
  "Delhi",
  "Kerala",
  "Andhra Pradesh",
  "Rajasthan",
  "Madhya Pradesh"
];

export default function FavoritesView({
  darkMode,
  setView,
  favorites,
  toggleFavorite,
  loading
}: FavoritesViewProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'alerts'>('saved');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);
  
  // Alert Creation Form State
  const [formSpecies, setFormSpecies] = useState<string>(AVAILABLE_SPECIES[0]);
  const [formRegion, setFormRegion] = useState<string>("All India");
  const [formPrice, setFormPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch alerts and notifications
  const fetchAlertsData = async () => {
    try {
      setLoadingAlerts(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const [alertsRes, notifsRes] = await Promise.all([
        fetch('/api/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/alerts/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        setNotifications(notifsData);
      }
    } catch (err) {
      console.error("Failed to load alerts data:", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrice || Number(formPrice) <= 0) {
      setFeedbackMessage({ type: 'error', text: 'Please enter a valid target price.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedbackMessage(null);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          speciesName: formSpecies,
          region: formRegion,
          targetPrice: Number(formPrice)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFormPrice("");
        fetchAlertsData();
        
        let successMsg = `Successfully subscribed to ${formSpecies} alerts.`;
        if (data.matchesFound > 0) {
          successMsg += ` Found ${data.matchesFound} instant matches! Check your notifications.`;
        }
        setFeedbackMessage({ type: 'success', text: successMsg });
      } else {
        const errData = await res.json();
        setFeedbackMessage({ type: 'error', text: errData.error || 'Failed to create alert.' });
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Server offline. Failed to establish alert subscription.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/alerts/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/alerts/notifications/read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/alerts/notifications/${notifId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== notifId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extract tree_id from alert messages if any to make it clickable
  const extractTreeId = (message: string): string | null => {
    const match = message.match(/\(ID: (tree_[a-f0-9-]+)\)/);
    return match ? match[1] : null;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-4 border-brand-moss border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-brand-earth font-semibold animate-pulse">Retrieving your tracking center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header and Toggle Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 border-brand-clay/35 dark:border-brand-darkborder">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">
            Buyer Tracking Center
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
            Monitor your bookmarked inventory listings and configure live regional price alert notifications.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className={`flex p-1 rounded-xl border self-start ${
          darkMode ? 'bg-brand-darkcard/50 border-brand-darkborder' : 'bg-brand-sand/55 border-brand-clay'
        }`}>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-brand-moss text-white shadow-md'
                : darkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-brand-moss hover:bg-white/40'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Bookmarked ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-brand-moss text-white shadow-md'
                : darkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-brand-moss hover:bg-white/40'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Price Alerts & Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black animate-pulse border border-white dark:border-brand-darkgreen">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bookmarked/Favorites Tab */}
      {activeTab === 'saved' && (
        <div>
          {favorites.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border flex flex-col items-center justify-center space-y-3 ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-brand-sand/35 border-brand-clay'
            }`}>
              <Heart className="w-10 h-10 text-rose-400" />
              <h3 className="font-serif font-bold text-base text-brand-moss dark:text-white">Your vault is empty</h3>
              <p className="text-sm text-brand-earth max-w-sm">
                Save trees that catch your eye while browsing the marketplace. They will appear here for fast price monitoring and seller outreach!
              </p>
              <button 
                onClick={() => setView('browse')}
                className="bg-brand-moss hover:bg-brand-sage text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer flex items-center gap-1.5 mx-auto transition-colors shadow-sm"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((tree) => (
                <div
                  key={tree.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] ${
                    darkMode 
                      ? 'bg-brand-darkcard border-brand-darkborder hover:border-brand-sage/40 hover:shadow-xl' 
                      : 'bg-white border-brand-clay hover:border-brand-sage hover:shadow-xl hover:shadow-brand-sand/20'
                  }`}
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-brand-sand">
                      <img src={tree.images[0]} alt={tree.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      <div className="absolute top-3 left-3 bg-brand-moss/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border border-white/10">
                        {tree.species || tree.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-brand-moss text-white font-bold px-3 py-1 rounded-lg text-sm border border-brand-clay/10">
                        ₹{tree.expectedPrice?.toLocaleString('en-IN') || tree.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-sm tracking-tight truncate group-hover:text-brand-sage transition-colors text-brand-moss dark:text-slate-200">{tree.name}</h3>
                      <div className="flex items-center justify-between text-[11px] text-brand-earth dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-brand-sage" /> {tree.district || tree.location.split(',')[0]}, {tree.state}</span>
                        <span>Age: {tree.age} yrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-brand-clay dark:border-brand-darkborder">
                      <button
                        onClick={() => setView('details', { id: tree.id })}
                        className="text-xs font-bold text-brand-sage hover:text-brand-moss hover:underline cursor-pointer focus:outline-none"
                      >
                        View details
                      </button>
                      <button
                        onClick={() => toggleFavorite(tree.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:underline cursor-pointer focus:outline-none"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Alerts and Notifications Tab */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Alert Box */}
          <div className="space-y-6 lg:col-span-1">
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-brand-sage" />
                <h3 className="font-serif font-black text-base text-brand-moss dark:text-white">Create Price Alert</h3>
              </div>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                {/* Species Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-brand-sage block">Tree Species</label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value)}
                    className={`w-full text-xs font-bold p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all ${
                      darkMode 
                        ? 'bg-brand-darkgreen/40 border-brand-darkborder text-slate-200' 
                        : 'bg-brand-sand/40 border-brand-clay text-brand-moss'
                    }`}
                  >
                    {AVAILABLE_SPECIES.map((spec) => (
                      <option key={spec} value={spec} className="font-bold">{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Region Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-brand-sage block">Region (State)</label>
                  <select
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className={`w-full text-xs font-bold p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all ${
                      darkMode 
                        ? 'bg-brand-darkgreen/40 border-brand-darkborder text-slate-200' 
                        : 'bg-brand-sand/40 border-brand-clay text-brand-moss'
                    }`}
                  >
                    {REGIONS.map((reg) => (
                      <option key={reg} value={reg} className="font-bold">{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Target Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-brand-sage block">Target Max Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-sage">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className={`w-full text-xs font-bold pl-8 p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all ${
                        darkMode 
                          ? 'bg-brand-darkgreen/40 border-brand-darkborder text-slate-200' 
                          : 'bg-brand-sand/40 border-brand-clay text-brand-moss'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-brand-earth dark:text-slate-400 block font-medium leading-normal">
                    Triggers notification when an approved tree listing or regional mandi price falls within your target max price.
                  </span>
                </div>

                {/* Feedback status */}
                {feedbackMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold border ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {feedbackMessage.text}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-moss hover:bg-brand-sage disabled:bg-brand-clay text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Subscribe Alerts
                </button>
              </form>
            </div>

            {/* Active alerts box */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-sage" />
                  <h3 className="font-serif font-black text-sm text-brand-moss dark:text-white">Active Alerts ({alerts.length})</h3>
                </div>
              </div>

              {alerts.length === 0 ? (
                <p className="text-xs font-medium text-brand-earth dark:text-slate-400">
                  No active alerts. Add an alert above to track regional timber price movements.
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        darkMode ? 'bg-brand-darkgreen/25 border-brand-darkborder/70' : 'bg-brand-sand/35 border-brand-clay/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-brand-moss dark:text-white block">
                          {alert.speciesName}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-brand-earth dark:text-slate-400 font-medium">
                          <span className="bg-brand-sage/10 text-brand-sage px-1.5 py-0.5 rounded font-black uppercase text-[8px] tracking-wider border border-brand-sage/25">
                            {alert.region}
                          </span>
                          <span>Max Price: ₹{alert.targetPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className={`p-2 rounded-lg hover:text-rose-500 hover:bg-rose-500/10 transition-colors ${
                          darkMode ? 'text-slate-400' : 'text-brand-earth'
                        }`}
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications Box */}
          <div className="space-y-4 lg:col-span-2">
            <div className={`p-6 rounded-2xl border h-full flex flex-col justify-between ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay'
            }`}>
              <div>
                <div className="flex items-center justify-between border-b border-brand-clay/35 dark:border-brand-darkborder pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <h3 className="font-serif font-black text-base text-brand-moss dark:text-white">Price Alerts Log</h3>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase px-2 py-0.5 rounded animate-pulse">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  {notifications.some(n => !n.isRead) && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-black uppercase tracking-wider text-brand-sage hover:text-brand-moss flex items-center gap-1 cursor-pointer focus:outline-none"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <Bell className="w-8 h-8 text-brand-clay mx-auto opacity-40" />
                    <p className="text-xs font-bold text-brand-earth dark:text-slate-400">No price alerts logged yet.</p>
                    <p className="text-[11px] text-brand-earth/70 dark:text-slate-500 max-w-xs mx-auto">
                      Whenever regional mandi prices or newly approved listings fall below your target, notifications will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {notifications.map((notif) => {
                      const associatedTreeId = extractTreeId(notif.message);
                      
                      return (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            notif.isRead
                              ? darkMode
                                ? 'bg-brand-darkgreen/10 border-brand-darkborder text-slate-300 opacity-70 hover:opacity-100'
                                : 'bg-slate-50 border-brand-clay/30 text-brand-earth'
                              : darkMode
                              ? 'bg-brand-darkgreen/40 border-brand-sage/30 text-white shadow-sm ring-1 ring-brand-sage/10'
                              : 'bg-amber-500/5 border-amber-500/20 text-brand-moss shadow-sm ring-1 ring-amber-500/10'
                          }`}
                        >
                          <div className="space-y-1 max-w-md">
                            <div className="flex items-center gap-2">
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
                              )}
                              <span className="font-serif font-black text-xs block">
                                {notif.title}
                              </span>
                            </div>
                            <p className="text-xs leading-normal font-medium">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-brand-earth/80 dark:text-slate-500 block font-mono">
                              {new Date(notif.createdAt).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Actionable button to jump to details if tree_id found */}
                            {associatedTreeId && (
                              <button
                                onClick={() => {
                                  // Mark as read first
                                  if (!notif.isRead) handleMarkAsRead(notif.id);
                                  setView('details', { id: associatedTreeId });
                                }}
                                className="bg-brand-moss hover:bg-brand-sage text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                View Listing <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            {!notif.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className={`p-1.5 rounded-lg hover:bg-brand-sage/10 hover:text-brand-sage transition-colors ${
                                  darkMode ? 'text-slate-400' : 'text-brand-earth'
                                }`}
                                title="Mark as Read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteNotification(notif.id)}
                              className={`p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors ${
                                darkMode ? 'text-slate-400' : 'text-brand-earth'
                              }`}
                              title="Delete Notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-brand-clay/20 dark:border-brand-darkborder/50 mt-4">
                <div className="flex gap-2 items-start text-[10px] text-brand-earth dark:text-slate-400 leading-normal font-medium">
                  <Info className="w-4 h-4 text-brand-sage shrink-0" />
                  <span>
                    Our AI monitoring arborist module scans timber listings and verified mandi prices. Updates automatically alert active subscribers instantly upon timber catalog approvals.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
