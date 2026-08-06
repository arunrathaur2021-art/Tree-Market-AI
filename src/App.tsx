import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import BrowseView from './components/BrowseView';
import TreeDetailsView from './components/TreeDetailsView';
import AuthView from './components/AuthView';
import SellerDashboardView from './components/SellerDashboardView';
import AdminPanelView from './components/AdminPanelView';
import FavoritesView from './components/FavoritesView';
import ChatView from './components/ChatView';
import NearbyTreesView from './components/NearbyTreesView';
import MandiPricesView from './components/MandiPricesView';
import DirectoryView from './components/DirectoryView';
import RegionalDashboardView from './components/RegionalDashboardView';
import RegionSelectorModal from './components/RegionSelectorModal';
import { RegionProvider } from './context/RegionContext';
import { User, Tree } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [user, setUser] = useState<User | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [favorites, setFavorites] = useState<Tree[]>([]);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? saved === 'true' : true; // Default to dark mode (emerald forest look)
  });

  const [loadingTrees, setLoadingTrees] = useState<boolean>(true);
  const [loadingFavs, setLoadingFavs] = useState<boolean>(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');

  // Persist theme choice
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Load and verify auth session on boot
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifySession(token);
    }
    fetchListings();
  }, []);

  // Fetch favorites when user role is buyer
  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const verifySession = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Purge expired sessions
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch {
      console.warn("Server offline, running offline simulation...");
    }
  };

  const fetchListings = async () => {
    try {
      setLoadingTrees(true);
      const res = await fetch('/api/trees');
      if (res.ok) {
        const data = await res.json();
        setTrees(data);
      }
    } catch (err) {
      console.error("Failed to fetch trees catalog:", err);
    } finally {
      setLoadingTrees(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoadingFavs(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFavs(false);
    }
  };

  const handleAuthSuccess = (token: string, verifiedUser: User) => {
    localStorage.setItem('token', token);
    setUser(verifiedUser);
    setCurrentView('home');
    fetchListings();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('home');
    fetchListings();
  };

  const toggleFavorite = async (treeId: string) => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    const isFav = favorites.some((f) => f.id === treeId);
    const endpoint = `/api/favorites/${treeId}`;
    const method = isFav ? 'DELETE' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await fetchFavorites();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const navigateToView = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Refresh trees list periodically on view change to stay synchronized
    fetchListings();
  };

  const handleHeroSearch = (query: string) => {
    setInitialSearchQuery(query);
    navigateToView('browse', { name: query });
  };

  const handleAdvancedSearch = (params: any) => {
    setInitialSearchQuery(params.name || '');
    navigateToView('browse', params);
  };

  return (
    <RegionProvider user={user}>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        darkMode ? 'bg-brand-darkgreen text-slate-100' : 'bg-brand-cream text-brand-moss'
      }`}>
        {/* Full-screen Region Selector Modal (Pops up on first visit or when triggered) */}
        <RegionSelectorModal darkMode={darkMode} />

        {/* Header / Navbar */}
        <Navbar
          currentView={currentView}
          setView={navigateToView}
          user={user}
          logout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {currentView === 'home' && (
            <HomeView
              trees={trees}
              setView={navigateToView}
              darkMode={darkMode}
              onSearch={handleHeroSearch}
              onAdvancedSearch={handleAdvancedSearch}
            />
          )}

          {(currentView === 'regional-dashboard' || currentView === 'regional') && (
            <RegionalDashboardView
              user={user}
              darkMode={darkMode}
              setView={navigateToView}
            />
          )}

          {currentView === 'browse' && (
          <BrowseView
            trees={trees}
            setView={navigateToView}
            darkMode={darkMode}
            initialQuery={initialSearchQuery}
            initialParams={viewParams}
          />
        )}

        {currentView === 'details' && (
          <TreeDetailsView
            treeId={viewParams.id}
            setView={navigateToView}
            user={user}
            darkMode={darkMode}
            isFavorited={favorites.some((f) => f.id === viewParams.id)}
            toggleFavorite={toggleFavorite}
          />
        )}

        {currentView === 'auth' && (
          <AuthView
            onAuthSuccess={handleAuthSuccess}
            darkMode={darkMode}
          />
        )}

        {(currentView === 'seller' || currentView === 'seller-dashboard') && (
          <SellerDashboardView
            user={user}
            darkMode={darkMode}
            setView={navigateToView}
          />
        )}

        {currentView === 'chat' && (
          <ChatView
            user={user}
            darkMode={darkMode}
            setView={navigateToView}
            initialPartnerId={viewParams.partnerId}
            initialTreeId={viewParams.treeId}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanelView
            darkMode={darkMode}
            setView={navigateToView}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            darkMode={darkMode}
            setView={navigateToView}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            loading={loadingFavs}
          />
        )}

        {currentView === 'nearby' && (
          <NearbyTreesView
            setView={navigateToView}
            darkMode={darkMode}
            user={user}
            onOpenChat={(sellerId, treeId) => navigateToView('chat', { partnerId: sellerId, treeId })}
          />
        )}

        {currentView === 'mandi' && (
          <MandiPricesView
            user={user}
            darkMode={darkMode}
            setView={navigateToView}
          />
        )}

        {currentView === 'directory' && (
          <DirectoryView
            user={user}
            darkMode={darkMode}
            setView={navigateToView}
          />
        )}


      </main>

      {/* Footer */}
      <footer className={`py-8 border-t text-center text-xs font-medium ${
        darkMode 
          ? 'bg-brand-darkcard/30 border-brand-darkborder text-slate-400' 
          : 'bg-white border-brand-clay text-brand-earth'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-2 text-slate-500 dark:text-slate-400">
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">© 2026 TreeMarket AI India. All Rights Reserved.</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Designed & Developed by Arun Rathaur</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto pt-1 leading-relaxed">
              TreeMarket AI India is an AI-powered digital marketplace connecting farmers, buyers, timber industries, transporters, and businesses across India.
            </p>
            <p className="text-[11px] text-slate-400 font-semibold">Designed, Developed and Maintained by Arun Rathaur.</p>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <button onClick={() => navigateToView('home')} className="hover:text-brand-sage font-semibold">Home</button>
            <button onClick={() => navigateToView('browse')} className="hover:text-brand-sage font-semibold">Marketplace</button>
            <a href="mailto:support@treemarket.com" className="hover:text-brand-sage font-semibold">Support</a>
          </div>
        </div>
      </footer>
    </div>
    </RegionProvider>
  );
}
