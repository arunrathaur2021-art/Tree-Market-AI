import React, { useState, useEffect } from 'react';
import { Leaf, User, Heart, LayoutDashboard, ShieldCheck, LogOut, Moon, Sun, MessageSquare, Navigation, Bell, Code, TrendingUp, Building2, Plus, MapPin, Compass } from 'lucide-react';
import { User as UserType } from '../types';
import { useRegion } from '../context/RegionContext';
import NotificationsDrawer from './NotificationsDrawer';

interface NavbarProps {
  currentView: string;
  setView: (view: string, params?: any) => void;
  user: UserType | null;
  logout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Navbar({
  currentView,
  setView,
  user,
  logout,
  darkMode,
  setDarkMode
}: NavbarProps) {
  const { selectedRegion, openRegionModal } = useRegion();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/alerts/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const notifs = await res.json();
        const unread = notifs.filter((n: any) => !n.isRead).length;
        setUnreadNotifications(unread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-colors duration-300 border-b ${
        darkMode 
          ? 'bg-brand-darkcard/95 border-brand-darkborder text-slate-100' 
          : 'bg-white/95 border-brand-clay text-brand-moss'
      } backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 min-h-[4.25rem] py-2.5">
            {/* Logo & Active Region Selector Badge */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button 
                onClick={() => setView('home')} 
                className="logo-container pt-4 pb-2 h-auto flex items-center gap-2.5 group cursor-pointer focus:outline-none overflow-visible"
                id="nav-logo"
              >
                <div className="w-10 h-10 shrink-0 bg-brand-moss rounded-xl flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 shadow-sm">
                  <Leaf className="w-5.5 h-5.5" />
                </div>
                <div className="text-left flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight block leading-tight">
                    TreeMarket <span className="text-brand-sage font-sans font-bold text-base sm:text-lg">AI</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-sans text-brand-earth tracking-wide leading-snug hidden sm:block">
                    India • Designed & Developed by Arun Rathaur
                  </span>
                </div>
              </button>

              {/* Header Active Region Button */}
              <button
                onClick={openRegionModal}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 ${
                  darkMode
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Click to Change Region"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  📍 {selectedRegion.street || selectedRegion.village || selectedRegion.district || 'Yamunanagar'}, {selectedRegion.state || 'Haryana'}
                </span>
              </button>
            </div>
            {/* Navigation Items */}
            <nav className="flex items-center gap-5 text-sm font-medium overflow-x-auto w-full md:w-auto order-last md:order-none pb-1 md:pb-0">
              <button
                onClick={() => setView('regional-dashboard')}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                  currentView === 'regional-dashboard'
                    ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                    : darkMode ? 'text-slate-300 hover:text-emerald-400' : 'text-brand-earth hover:text-emerald-600'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                Regional Hub
              </button>

              <button
                onClick={() => setView('home')}
                className={`transition-colors py-1 cursor-pointer focus:outline-none ${
                  currentView === 'home' 
                    ? darkMode ? 'text-brand-sage border-b-2 border-brand-sage font-bold' : 'text-brand-moss border-b-2 border-brand-moss font-bold' 
                    : darkMode ? 'text-slate-300 hover:text-brand-sage' : 'text-brand-earth hover:text-brand-moss'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setView('browse')}
                className={`transition-colors py-1 cursor-pointer focus:outline-none ${
                  currentView === 'browse' 
                    ? darkMode ? 'text-brand-sage border-b-2 border-brand-sage font-bold' : 'text-brand-moss border-b-2 border-brand-moss font-bold' 
                    : darkMode ? 'text-slate-300 hover:text-brand-sage' : 'text-brand-earth hover:text-brand-moss'
                }`}
              >
                Marketplace
              </button>

              <button
                onClick={() => setView('mandi')}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                  currentView === 'mandi'
                    ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                    : darkMode ? 'text-slate-300 hover:text-amber-400' : 'text-brand-earth hover:text-amber-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Mandi Rates
              </button>

              <button
                onClick={() => setView('directory')}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                  currentView === 'directory'
                    ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                    : darkMode ? 'text-slate-300 hover:text-emerald-400' : 'text-brand-earth hover:text-emerald-600'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-500" />
                Business Directory
              </button>

              <button
                onClick={() => setView('nearby')}
                className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                  currentView === 'nearby'
                    ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
                    : darkMode ? 'text-slate-300 hover:text-emerald-400' : 'text-brand-earth hover:text-emerald-600'
                }`}
              >
                <Navigation className="w-4 h-4 text-brand-sage" />
                Nearby Radar
              </button>
              
              {user && user.role === 'buyer' && (
                <button
                  onClick={() => setView('favorites')}
                  className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                    currentView === 'favorites'
                      ? 'text-rose-400 border-b-2 border-rose-400 font-bold'
                      : darkMode ? 'text-slate-300 hover:text-rose-400' : 'text-brand-earth hover:text-rose-600'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Tracking Center
                </button>
              )}

              {user && (
                <button
                  onClick={() => setView('chat')}
                  className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                    currentView === 'chat'
                      ? darkMode ? 'text-brand-sage border-b-2 border-brand-sage font-bold' : 'text-brand-moss border-b-2 border-brand-moss font-bold'
                      : darkMode ? 'text-slate-300 hover:text-brand-sage' : 'text-brand-earth hover:text-brand-moss'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Inbox
                </button>
              )}

              {user && user.role === 'seller' && (
                <button
                  onClick={() => setView('seller')}
                  className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                    currentView === 'seller'
                      ? darkMode ? 'text-brand-sage border-b-2 border-brand-sage font-bold' : 'text-brand-moss border-b-2 border-brand-moss font-bold'
                      : darkMode ? 'text-slate-300 hover:text-brand-sage' : 'text-brand-earth hover:text-brand-moss'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Nursery Dashboard
                </button>
              )}

              {user && user.role === 'admin' && (
                <button
                  onClick={() => setView('admin')}
                  className={`flex items-center gap-1.5 transition-colors py-1 cursor-pointer focus:outline-none ${
                    currentView === 'admin'
                      ? 'text-amber-500 border-b-2 border-amber-500 font-bold'
                      : darkMode ? 'text-slate-300 hover:text-amber-400' : 'text-brand-earth hover:text-amber-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
            </nav>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              {user && (
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className={`relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                    darkMode 
                      ? 'hover:bg-brand-darkborder text-slate-300 hover:text-white' 
                      : 'hover:bg-brand-clay/30 text-brand-earth hover:text-brand-moss'
                  }`}
                  title="Notifications & Price Alerts"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-brand-darkcard animate-pulse" />
                  )}
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  darkMode 
                    ? 'hover:bg-brand-darkborder text-amber-400 hover:text-amber-300' 
                    : 'hover:bg-brand-clay/30 text-brand-earth hover:text-brand-moss'
                }`}
                title="Toggle Light/Dark Theme"
                id="theme-toggle"
              >
                {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  {/* User avatar / initials */}
                  <button
                    onClick={() => {
                      if (user.role === 'seller') setView('seller');
                      else if (user.role === 'admin') setView('admin');
                      else setView('favorites');
                    }}
                    className={`hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-xl text-sm font-medium border cursor-pointer focus:outline-none ${
                      darkMode 
                        ? 'bg-brand-darkcard border-brand-darkborder text-slate-200 hover:bg-brand-darkborder' 
                        : 'bg-brand-sand border-brand-clay text-brand-moss hover:bg-white'
                    }`}
                  >
                    <User className="w-4 h-4 text-brand-sage" />
                    <span>{user.name}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      user.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : user.role === 'seller'
                        ? 'bg-brand-sage/10 text-brand-sage border border-brand-sage/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className={`p-2.5 rounded-xl transition-all duration-200 text-rose-500 cursor-pointer focus:outline-none ${
                      darkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-500/5'
                    }`}
                    title="Logout"
                    id="logout-btn"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('auth')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full border cursor-pointer transition-all ${
                      darkMode
                        ? 'border-brand-darkborder bg-brand-darkcard hover:bg-brand-darkborder text-slate-200'
                        : 'border-brand-moss hover:bg-brand-moss hover:text-white text-brand-moss'
                    }`}
                    id="login-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setView('auth')}
                    className="px-6 py-2 text-sm font-semibold bg-brand-moss hover:bg-brand-sage text-white rounded-full transition-colors cursor-pointer"
                  >
                    List a Tree
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Component */}
      <NotificationsDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        darkMode={darkMode}
        setView={setView}
        unreadCount={unreadNotifications}
        onRefreshUnread={fetchUnreadCount}
      />
    </>
  );
}
