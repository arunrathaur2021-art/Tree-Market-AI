import React, { useState, useEffect } from 'react';
import {
  Building2, Search, Mic, MapPin, Filter, Plus, ShieldCheck, Star, Phone,
  MessageSquare, Share2, Bookmark, ExternalLink, Sparkles, Navigation, Globe,
  CheckCircle, ArrowRight, X, ChevronRight, SlidersHorizontal, Eye, AlertCircle,
  Truck, TreeDeciduous, Factory, Wrench, Coins, Cpu, RefreshCw
} from 'lucide-react';
import { Business, User } from '../types';
import RegisterBusinessModal from './RegisterBusinessModal';
import BusinessProfileModal from './BusinessProfileModal';
import RequestQuoteModal from './RequestQuoteModal';
import BusinessDashboardModal from './BusinessDashboardModal';

interface DirectoryViewProps {
  user: User | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
}

const CATEGORIES = [
  'All', 'Timber Industries', 'Sawmills', 'Furniture Manufacturers', 'Plywood Industries',
  'Paper Mills', 'Wood Traders', 'Tree Buyers', 'Exporters', 'Importers',
  'Nurseries', 'Seed Suppliers', 'Plant Suppliers', 'Farm Equipment Dealers',
  'Transport & Logistics', 'Cold Storage', 'Warehouse', 'Packaging',
  'Government Departments', 'Forest Contractors', 'Carpenters', 'Wood Processing Units',
  'Biomass Plants', 'Biofuel Companies', 'Wood Pellet Industries', 'Consultants',
  'Banks & Finance', 'Insurance', 'Agricultural Services', 'Labor Contractors',
  'Machine Rental', 'Other Businesses'
];

const STATES = [
  'All', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Karnataka', 'Maharashtra', 'Gujarat',
  'Tamil Nadu', 'Andhra Pradesh', 'Kerala', 'Madhya Pradesh', 'Rajasthan',
  'West Bengal', 'Bihar', 'Odisha', 'Telangana', 'Uttarakhand', 'Himachal Pradesh'
];

export default function DirectoryView({ user, darkMode, setView }: DirectoryViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [talukaFilter, setTalukaFilter] = useState<string>('');
  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyPremium, setOnlyPremium] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('English');

  // Modals & Active Selections
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [quoteBusiness, setQuoteBusiness] = useState<Business | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Saved Bookmarks
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // AI Recommendation Data
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [loadingAiRecs, setLoadingAiRecs] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory, selectedState, districtFilter, talukaFilter, pincodeFilter, onlyVerified, onlyPremium]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'All') queryParams.set('category', selectedCategory);
      if (selectedState !== 'All') queryParams.set('state', selectedState);
      if (districtFilter.trim()) queryParams.set('district', districtFilter.trim());
      if (talukaFilter.trim()) queryParams.set('taluka', talukaFilter.trim());
      if (pincodeFilter.trim()) queryParams.set('pincode', pincodeFilter.trim());
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
      if (onlyVerified) queryParams.set('verified', 'true');
      if (onlyPremium) queryParams.set('premium', 'true');

      const res = await fetch(`/api/businesses?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const fetchAIRecommendations = async () => {
    setLoadingAiRecs(true);
    try {
      const res = await fetch('/api/businesses/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: user?.role || 'farmer',
          treeSpecies: 'Teak & Poplar',
          state: selectedState !== 'All' ? selectedState : (user?.state || 'Haryana'),
          district: districtFilter || (user?.district || 'Yamunanagar')
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiRecs(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is simulated in your browser mode.");
      setSearchQuery("Sawmill Yamunanagar");
      return;
    }

    setIsListening(true);
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        fetchBusinesses();
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch {
      setIsListening(false);
      setSearchQuery("Poplar Plywood Industry");
    }
  };

  const toggleBookmark = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(i => i !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const handleAdminVerify = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/businesses/${id}/verify`, { method: 'PUT' });
      if (res.ok) fetchBusinesses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-xl ${
        darkMode ? 'bg-gradient-to-r from-emerald-950 via-brand-darkcard to-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-brand-moss border-brand-clay text-white'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> India Pan-National B2B Network
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                Verified Agro & Timber Partners
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight">
              TreeMarket AI <span className="text-emerald-400">Business Directory</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Connecting farmers, buyers, sawmills, plywood factories, nurseries, logistics, and agricultural service providers across India.
            </p>
          </div>

          {/* Quick Action & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 focus:outline-none cursor-pointer"
            >
              <option value="English" className="text-slate-900">🌐 English</option>
              <option value="Hindi" className="text-slate-900">🌐 हिंदी (Hindi)</option>
              <option value="Marathi" className="text-slate-900">🌐 मराठी (Marathi)</option>
              <option value="Punjabi" className="text-slate-900">🌐 ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="Tamil" className="text-slate-900">🌐 தமிழ் (Tamil)</option>
              <option value="Telugu" className="text-slate-900">🌐 తెలుగు (Telugu)</option>
              <option value="Gujarati" className="text-slate-900">🌐 ગુજરાતી (Gujarati)</option>
            </select>

            {/* Dashboard Button */}
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Building2 className="w-4 h-4 text-emerald-300" /> My Business Dashboard
            </button>

            {/* Register Green Button */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> + Register Business
            </button>
          </div>
        </div>
      </div>

      {/* Smart Search Bar & Location Hierarchy Filters */}
      <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-md ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay'
      }`}>
        {/* Search Bar with Autocomplete & Voice */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Business Name, Owner, City, Village, District, State, PIN or Category..."
              className={`w-full pl-11 pr-12 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`absolute right-3 top-2.5 p-1 rounded-lg transition-colors cursor-pointer ${
                isListening ? 'text-rose-500 bg-rose-500/20 animate-pulse' : 'text-slate-400 hover:text-emerald-500'
              }`}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4" /> Search Directory
          </button>
        </form>

        {/* Location Hierarchy Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-emerald-500/10">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">District</label>
            <input
              type="text"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="e.g. Yamunanagar"
              className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Taluka / Tehsil</label>
            <input
              type="text"
              value={talukaFilter}
              onChange={(e) => setTalukaFilter(e.target.value)}
              placeholder="e.g. Jagadhri"
              className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">PIN Code</label>
            <input
              type="text"
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              placeholder="e.g. 135001"
              className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
            <button
              onClick={() => {
                setOnlyVerified(!onlyVerified);
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                onlyVerified ? 'bg-emerald-600 text-white border-emerald-600' : darkMode ? 'border-brand-darkborder text-slate-300' : 'border-slate-300 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Only
            </button>
          </div>
        </div>
      </div>

      {/* Category Pill Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" /> Filter Directory by Category
          </h2>
          <span className="text-xs text-slate-400 font-medium">{businesses.length} Businesses Found</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105'
                    : darkMode
                    ? 'bg-brand-darkcard hover:bg-brand-darkborder border-brand-darkborder text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Business Recommendation Trigger Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        darkMode ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Trade Matchmaking & Market Intelligence</h3>
            <p className="text-xs text-indigo-300">
              Get intelligent industry recommendations for {selectedState !== 'All' ? selectedState : 'your state'} based on local wood demand.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAIRecommendations}
          disabled={loadingAiRecs}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
        >
          {loadingAiRecs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Get AI Industry Recommendations
        </button>
      </div>

      {/* Render AI Recommendations Result if loaded */}
      {aiRecs && (
        <div className={`p-5 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-indigo-900/20 border-indigo-500/40' : 'bg-indigo-50/80 border-indigo-300'
        }`}>
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Recommendations for {selectedState !== 'All' ? selectedState : 'India'}
            </h4>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30">
              Opportunity Score: {aiRecs.marketOpportunityScore}%
            </span>
          </div>

          <p className="text-xs text-slate-300">{aiRecs.buyersDemandOverview}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {(aiRecs.growthStrategyTips || []).map((tip: string, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-black/20 border border-indigo-500/20 text-[11px] text-slate-200 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directory Business Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-700/30" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'}`}>
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold">No Directory Listings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try resetting location filters or register your business to be the first partner listed in this region.
          </p>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            + Register Business Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => {
            const isSaved = savedIds.includes(biz.id);
            return (
              <div
                key={biz.id}
                onClick={() => setSelectedBusiness(biz)}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder hover:border-emerald-500/50' : 'bg-white border-brand-clay hover:border-emerald-500'
                }`}
              >
                {/* Card Top Banner / Logo */}
                <div>
                  <div className="relative h-36 bg-slate-800 overflow-hidden">
                    <img
                      src={biz.coverUrl || 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=80'}
                      alt={biz.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Verified & Premium Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {biz.verified && (
                        <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {biz.isPremium && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" /> Premium
                        </span>
                      )}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(biz.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm cursor-pointer"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Logo thumbnail */}
                    <div className="absolute -bottom-3 left-4 w-14 h-14 rounded-xl bg-white p-0.5 shadow-xl border border-emerald-500 overflow-hidden">
                      <img
                        src={biz.logoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=200&auto=format&fit=crop&q=80'}
                        alt={biz.businessName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Rating pill */}
                    <div className="absolute bottom-2 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-amber-400 text-xs font-bold border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{biz.rating}</span>
                      <span className="text-[10px] text-slate-300">({biz.reviewCount})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 pt-5 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">{biz.category}</span>
                      <h3 className="font-bold text-base font-serif line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {biz.businessName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{biz.district}, {biz.state}</span>
                        {biz.pincode && <span>({biz.pincode})</span>}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                      {biz.description}
                    </p>

                    {/* Current Procurement highlight if present */}
                    {biz.currentRequirements && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 line-clamp-1">
                        <span className="font-bold">Buying: </span>{biz.currentRequirements}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className={`p-3 border-t flex items-center justify-between gap-1.5 ${
                  darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-100'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBusiness(biz);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View Profile
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setView('chat', { partnerId: biz.userId, treeId: biz.id });
                      }}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                      title="Chat in Inbox"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`tel:${biz.mobile}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                      title="Call Owner"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {user && user.role === 'admin' && (
                      <button
                        onClick={(e) => handleAdminVerify(biz.id, e)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          biz.verified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                        title="Admin Toggle Verification"
                      >
                        {biz.verified ? 'Verified' : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RegisterBusinessModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        user={user}
        darkMode={darkMode}
        onBusinessCreated={() => fetchBusinesses()}
      />

      <BusinessProfileModal
        business={selectedBusiness}
        isOpen={!!selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        user={user}
        darkMode={darkMode}
        setView={setView}
        onRequestQuote={(biz) => {
          setSelectedBusiness(null);
          setQuoteBusiness(biz);
        }}
      />

      <RequestQuoteModal
        business={quoteBusiness}
        isOpen={!!quoteBusiness}
        onClose={() => setQuoteBusiness(null)}
        user={user}
        darkMode={darkMode}
      />

      <BusinessDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        user={user}
        darkMode={darkMode}
        businesses={businesses}
        onRefresh={() => fetchBusinesses()}
      />
    </div>
  );
}
