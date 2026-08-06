import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Search, MapPin, Filter, Sparkles, 
  BarChart3, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, 
  Share2, Heart, Bell, Download, Check, X, Compass, Layers, 
  Award, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, Info, FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { User } from '../types';
import IndiaLocationSelect from './IndiaLocationSelect';

interface MandiItem {
  id: string;
  commodity: string;
  variety: string;
  grade: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  averagePrice: number;
  arrivalQuantity: number;
  quantityUnit: string;
  mandiName: string;
  district: string;
  state: string;
  dateUpdated: string;
  priceChange: number;
  priceChangeAmount: number;
  weeklyTrend: string;
  monthlyTrend: string;
  yearlyTrend: string;
  marketStatus: 'Open' | 'Closed';
  demandLevel: 'High' | 'Very High' | 'Moderate' | 'Extreme';
  coordinates: { lat: number; lng: number };
}

interface MandiPricesViewProps {
  user: User | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
}

const SPECIES_LIST = [
  'All',
  'Teak (Sagwan)',
  'Eucalyptus',
  'Poplar',
  'Melia Dubia (Malabar Neem)',
  'Sandalwood (Chandan)',
  'Bamboo',
  'Neem',
  'Sheesham (Rosewood)',
  'Mahogany',
  'Casuarina (Chowku)',
  'Subabul',
  'Mango Wood',
  'Silver Oak',
  'Rubber Wood',
  'Acacia',
  'Coconut Timber',
  'Arecanut Trunk'
];

export default function MandiPricesView({
  user,
  darkMode,
  setView
}: MandiPricesViewProps) {
  // State
  const [mandiData, setMandiData] = useState<MandiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('trend'); // 'trend' | 'priceHigh' | 'priceLow' | 'arrival'

  // Tabs
  const [activeTab, setActiveTab] = useState<'live' | 'charts' | 'ai' | 'compare' | 'nearby'>('live');

  // Chart data
  const [selectedChartCommodity, setSelectedChartCommodity] = useState<string>('Teak (Sagwan)');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '6m' | '1y'>('30d');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // AI Analysis Panel
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  // Compare Mandis
  const [comparedMandiIds, setComparedMandiIds] = useState<string[]>([]);

  // User persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('fav_mandis');
    return saved ? JSON.parse(saved) : ['mandi-1', 'mandi-2'];
  });

  // Modal states
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertTargetCommodity, setAlertTargetCommodity] = useState<string>('Teak (Sagwan)');
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(50000);
  const [alertSuccess, setAlertSuccess] = useState<boolean>(false);

  // Fetch Mandi Data
  useEffect(() => {
    fetchMandiPrices();
  }, [selectedState, selectedDistrict, selectedCommodity, searchQuery, sortBy]);

  useEffect(() => {
    if (activeTab === 'charts') {
      fetchHistoryData();
    }
  }, [activeTab, selectedChartCommodity, timeframe]);

  useEffect(() => {
    if (activeTab === 'ai') {
      fetchAIAnalysis();
    }
  }, [activeTab, selectedChartCommodity]);

  const fetchMandiPrices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedState !== 'All') queryParams.append('state', selectedState);
      if (selectedDistrict) queryParams.append('district', selectedDistrict);
      if (selectedCommodity !== 'All') queryParams.append('commodity', selectedCommodity);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sortBy) queryParams.append('sortBy', sortBy);

      const res = await fetch(`/api/mandi/prices?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMandiData(data);
      }
    } catch (err) {
      console.error("Failed to fetch mandi prices", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/mandi/history?commodity=${encodeURIComponent(selectedChartCommodity)}&timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAIAnalysis = async () => {
    try {
      setLoadingAI(true);
      const res = await fetch('/api/mandi/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedChartCommodity,
          state: selectedState !== 'All' ? selectedState : 'Karnataka',
          district: selectedDistrict || 'Mysuru'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleFavorite = (mandiId: string) => {
    let updated = [...favorites];
    if (updated.includes(mandiId)) {
      updated = updated.filter(id => id !== mandiId);
    } else {
      updated.push(mandiId);
    }
    setFavorites(updated);
    localStorage.setItem('fav_mandis', JSON.stringify(updated));
  };

  const toggleCompare = (mandiId: string) => {
    let updated = [...comparedMandiIds];
    if (updated.includes(mandiId)) {
      updated = updated.filter(id => id !== mandiId);
    } else {
      if (updated.length >= 3) {
        alert("You can compare up to 3 Mandis at a time.");
        return;
      }
      updated.push(mandiId);
    }
    setComparedMandiIds(updated);
  };

  const handleCreatePriceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setView('auth');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          treeCategory: alertTargetCommodity,
          maxPrice: alertTargetPrice,
          minPrice: Math.round(alertTargetPrice * 0.8),
          state: selectedState !== 'All' ? selectedState : undefined
        })
      });
      if (res.ok) {
        setAlertSuccess(true);
        setTimeout(() => {
          setAlertSuccess(false);
          setShowAlertModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (mandiData.length === 0) return;
    const headers = ["Commodity", "Variety", "Grade", "Mandi Name", "District", "State", "Modal Price (INR)", "Min Price", "Max Price", "Arrivals", "Price Change (%)", "Date"];
    const rows = mandiData.map(m => [
      `"${m.commodity}"`,
      `"${m.variety}"`,
      `"${m.grade}"`,
      `"${m.mandiName}"`,
      `"${m.district}"`,
      `"${m.state}"`,
      m.modalPrice,
      m.minPrice,
      m.maxPrice,
      `"${m.arrivalQuantity} ${m.quantityUnit}"`,
      `"${m.priceChange}%"`,
      `"${m.dateUpdated}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TreeMarket_Mandi_Prices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top Dashboard Metrics Calculations
  const highestPricedItem = mandiData.length ? [...mandiData].sort((a, b) => b.modalPrice - a.modalPrice)[0] : null;
  const lowestPricedItem = mandiData.length ? [...mandiData].sort((a, b) => a.modalPrice - b.modalPrice)[0] : null;
  const topGainerItem = mandiData.length ? [...mandiData].sort((a, b) => b.priceChange - a.priceChange)[0] : null;
  const topDeclinerItem = mandiData.length ? [...mandiData].sort((a, b) => a.priceChange - b.priceChange)[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in" id="mandi-prices-container">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-r from-brand-darkcard via-brand-darkgreen to-brand-darkcard border-brand-darkborder text-white' 
          : 'bg-gradient-to-r from-brand-moss via-brand-sage to-brand-moss text-white border-brand-clay shadow-md'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Government APMC & Agmarknet Synced
              </span>
              <span className="text-white/80 text-xs font-medium">Updated Today • Live India Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Indian Timber Mandi Rates (APMC)
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl leading-relaxed">
              Real-time market prices, arrival quantities, AI price trends, and top paying timber yards across all Indian States & UTs.
            </p>
            <p className="text-[11px] text-white/70 mt-1 font-semibold">
              Designed, Developed and Maintained by Arun Rathaur | TreeMarket AI India
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAlertModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-4 h-4" /> Set Price Alert
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Analytical Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Price */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider block">Today's Peak Price</span>
            <h4 className="text-lg font-bold text-brand-moss dark:text-white mt-0.5 truncate max-w-[170px]">
              {highestPricedItem ? highestPricedItem.commodity : 'Teak Wood'}
            </h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{highestPricedItem ? highestPricedItem.modalPrice.toLocaleString('en-IN') : '0'}
              </span>
              <span className="text-[10px] text-brand-earth">/{highestPricedItem?.quantityUnit || 'Ton'}</span>
            </div>
            <span className="text-[10px] text-brand-earth truncate block mt-0.5">{highestPricedItem?.mandiName}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Top Gainer */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider block">Fastest Price Gainer</span>
            <h4 className="text-lg font-bold text-brand-moss dark:text-white mt-0.5 truncate max-w-[170px]">
              {topGainerItem ? topGainerItem.commodity : 'Malabar Neem'}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-5 h-5" /> +{topGainerItem ? topGainerItem.priceChange : '0'}%
              </span>
            </div>
            <span className="text-[10px] text-brand-earth truncate block mt-0.5">{topGainerItem?.mandiName}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Highest Arrival Volume */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider block">Top Market Supply</span>
            <h4 className="text-lg font-bold text-brand-moss dark:text-white mt-0.5 truncate max-w-[170px]">
              Yamunanagar APMC
            </h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-brand-moss dark:text-slate-200">
                1,850
              </span>
              <span className="text-[10px] text-brand-earth">Tons Today</span>
            </div>
            <span className="text-[10px] text-brand-earth truncate block mt-0.5">Eucalyptus & Poplar Hub</span>
          </div>
          <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Lowest Price Entry */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider block">Lowest Price Entry</span>
            <h4 className="text-lg font-bold text-brand-moss dark:text-white mt-0.5 truncate max-w-[170px]">
              {lowestPricedItem ? lowestPricedItem.commodity : 'Bamboo'}
            </h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ₹{lowestPricedItem ? lowestPricedItem.modalPrice.toLocaleString('en-IN') : '0'}
              </span>
              <span className="text-[10px] text-brand-earth">/{lowestPricedItem?.quantityUnit || 'Quintal'}</span>
            </div>
            <span className="text-[10px] text-brand-earth truncate block mt-0.5">{lowestPricedItem?.mandiName}</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Filter Bar */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-brand-earth absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search timber species or APMC mandi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            />
          </div>

          {/* Species Dropdown */}
          <div>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            >
              <option value="All">All Timber Species</option>
              {SPECIES_LIST.filter(s => s !== 'All').map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            >
              <option value="trend">Sort by Price Trend (↑)</option>
              <option value="priceHigh">Sort by Modal Price (High → Low)</option>
              <option value="priceLow">Sort by Modal Price (Low → High)</option>
              <option value="arrival">Sort by Arrival Quantity</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSelectedState('All');
              setSelectedDistrict('');
              setSelectedCommodity('All');
              setSearchQuery('');
              setSortBy('trend');
            }}
            className="px-3 py-2 text-xs font-bold text-brand-earth hover:text-brand-moss dark:hover:text-white border border-brand-clay dark:border-brand-darkborder rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {/* State & District Hierarchical Filter */}
        <div className="pt-2 border-t border-brand-clay/40 dark:border-brand-darkborder">
          <IndiaLocationSelect
            state={selectedState === 'All' ? '' : selectedState}
            district={selectedDistrict}
            onChange={(loc) => {
              if (loc.state) setSelectedState(loc.state);
              else if (loc.state === '') setSelectedState('All');
              if (loc.district !== undefined) setSelectedDistrict(loc.district);
            }}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Main Feature Navigation Tabs */}
      <div className="flex border-b border-brand-clay dark:border-brand-darkborder overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-3 px-4 font-serif font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'live'
              ? 'border-b-2 border-brand-sage text-brand-sage'
              : 'text-brand-earth hover:text-brand-moss dark:hover:text-white'
          }`}
        >
          Live Mandi Rates ({mandiData.length})
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`pb-3 px-4 font-serif font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'charts'
              ? 'border-b-2 border-brand-sage text-brand-sage'
              : 'text-brand-earth hover:text-brand-moss dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Price History & Trends
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-4 font-serif font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'border-b-2 border-brand-sage text-brand-sage'
              : 'text-brand-earth hover:text-brand-moss dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" /> AI Market Analysis
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`pb-3 px-4 font-serif font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'compare'
              ? 'border-b-2 border-brand-sage text-brand-sage'
              : 'text-brand-earth hover:text-brand-moss dark:hover:text-white'
          }`}
        >
          Compare Mandis {comparedMandiIds.length > 0 && `(${comparedMandiIds.length})`}
        </button>
      </div>

      {/* Tab 1: Live Mandi Rates */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-brand-earth gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-sage" />
              <p className="text-xs font-semibold">Fetching APMC Mandi price feeds...</p>
            </div>
          ) : mandiData.length === 0 ? (
            <div className="p-12 text-center text-brand-earth border rounded-2xl">
              <AlertCircle className="w-12 h-12 text-brand-sage/40 mx-auto mb-2" />
              <p className="text-sm font-bold">No Mandi prices found matching your search filter.</p>
              <button onClick={() => { setSelectedState('All'); setSelectedCommodity('All'); setSearchQuery(''); }} className="mt-2 text-xs text-brand-sage font-bold hover:underline">Reset Filters</button>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase tracking-wider font-bold text-[10px] border-b ${
                    darkMode ? 'bg-brand-darkgreen/60 border-brand-darkborder text-slate-300' : 'bg-brand-sand border-brand-clay text-brand-moss'
                  }`}>
                    <tr>
                      <th className="p-3.5">Compare</th>
                      <th className="p-3.5">Commodity / Variety</th>
                      <th className="p-3.5">APMC Mandi & Location</th>
                      <th className="p-3.5 text-right">Modal Price</th>
                      <th className="p-3.5 text-right">Min - Max Price</th>
                      <th className="p-3.5 text-right">Arrivals</th>
                      <th className="p-3.5 text-center">24h Trend</th>
                      <th className="p-3.5 text-center">Status & Demand</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-clay/40 dark:divide-brand-darkborder/60">
                    {mandiData.map((m) => {
                      const isFav = favorites.includes(m.id);
                      const isComp = comparedMandiIds.includes(m.id);
                      return (
                        <tr key={m.id} className={`hover:bg-brand-clay/10 dark:hover:bg-brand-darkgreen/30 transition-colors ${
                          isComp ? 'bg-amber-500/5' : ''
                        }`}>
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              checked={isComp}
                              onChange={() => toggleCompare(m.id)}
                              className="rounded border-brand-clay text-brand-sage focus:ring-brand-sage cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-sm text-brand-moss dark:text-white">{m.commodity}</div>
                            <div className="text-[10px] text-brand-earth">{m.variety} • Grade {m.grade}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-brand-moss dark:text-slate-200 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-sage" /> {m.mandiName}
                            </div>
                            <div className="text-[10px] text-brand-earth">{m.district}, {m.state}</div>
                          </td>
                          <td className="p-3.5 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            ₹{m.modalPrice.toLocaleString('en-IN')}
                            <span className="text-[9px] font-normal text-brand-earth block">/ {m.quantityUnit}</span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="font-semibold text-brand-moss dark:text-slate-300">
                              ₹{m.minPrice.toLocaleString('en-IN')} - ₹{m.maxPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[9px] text-brand-earth">Avg: ₹{m.averagePrice.toLocaleString('en-IN')}</div>
                          </td>
                          <td className="p-3.5 text-right font-semibold text-brand-moss dark:text-slate-200">
                            {m.arrivalQuantity.toLocaleString()} {m.quantityUnit}s
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.priceChange >= 0 
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}>
                              {m.priceChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {m.priceChange > 0 ? '+' : ''}{m.priceChange}%
                            </span>
                          </td>
                          <td className="p-3.5 text-center space-y-1">
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider block ${
                              m.marketStatus === 'Open' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 text-slate-400'
                            }`}>
                              {m.marketStatus}
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/15 text-amber-500 block">
                              {m.demandLevel} Demand
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => toggleFavorite(m.id)}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                  isFav 
                                    ? 'bg-rose-500 text-white border-rose-500' 
                                    : 'border-brand-clay dark:border-brand-darkborder text-brand-earth hover:text-rose-500'
                                }`}
                                title={isFav ? "Remove Favorite" : "Save Favorite Mandi"}
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <button
                                onClick={() => {
                                  setAlertTargetCommodity(m.commodity);
                                  setAlertTargetPrice(m.modalPrice);
                                  setShowAlertModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-brand-clay dark:border-brand-darkborder text-brand-earth hover:text-amber-500 cursor-pointer"
                                title="Alert on Price Drop/Increase"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Price History & Trends */}
      {activeTab === 'charts' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-moss dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-sage" /> Timber Price Trajectory & Historical Analysis
              </h3>
              <p className="text-xs text-brand-earth">Daily modal prices and arrival volume trends over time.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedChartCommodity}
                onChange={(e) => setSelectedChartCommodity(e.target.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                }`}
              >
                {SPECIES_LIST.filter(s => s !== 'All').map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>

              <div className="flex bg-brand-sand dark:bg-brand-darkgreen p-1 rounded-xl border border-brand-clay dark:border-brand-darkborder text-xs font-bold">
                {(['7d', '30d', '6m', '1y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-lg uppercase cursor-pointer transition-all ${
                      timeframe === tf ? 'bg-brand-moss text-white shadow-xs' : 'text-brand-earth hover:text-brand-moss dark:hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          {loadingHistory ? (
            <div className="h-72 flex items-center justify-center text-brand-earth">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-sage" />
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="modalPriceColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1d2720' : '#ffffff', 
                      borderRadius: '12px', 
                      borderColor: '#4d6854',
                      fontSize: '12px' 
                    }} 
                  />
                  <Area type="monotone" dataKey="modalPrice" name="Modal Price (₹)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#modalPriceColor)" />
                  <Area type="monotone" dataKey="maxPrice" name="Max Price (₹)" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={0} />
                  <Area type="monotone" dataKey="minPrice" name="Min Price (₹)" stroke="#6366f1" strokeWidth={1.5} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Market Analysis */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border space-y-6 ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-brand-moss dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> AI Market Intelligence & Selling Advice
                </h3>
                <p className="text-xs text-brand-earth">Gemini 2.5 Market Forecast Engine tailored for Indian timber species.</p>
              </div>

              <select
                value={selectedChartCommodity}
                onChange={(e) => setSelectedChartCommodity(e.target.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border focus:outline-none ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                }`}
              >
                {SPECIES_LIST.filter(s => s !== 'All').map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            {loadingAI ? (
              <div className="p-12 text-center text-brand-earth">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-sage mx-auto mb-2" />
                <p className="text-xs font-semibold">Gemini AI analyzing industrial demand & price forecasts...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-brand-sage/30 bg-brand-sage/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-brand-sage">Best APMC Market to Sell</span>
                  <p className="text-base font-bold text-brand-moss dark:text-white">{aiAnalysis.bestMarketToSell}</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-500">Optimal Selling Window</span>
                  <p className="text-base font-bold text-brand-moss dark:text-white">{aiAnalysis.bestTimeToSell}</p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-500">30-60 Day Forecast</span>
                  <p className="text-base font-bold text-brand-moss dark:text-white">{aiAnalysis.expectedFuturePrice}</p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">Estimated Net Profit Margin</span>
                  <p className="text-base font-bold text-brand-moss dark:text-white">{aiAnalysis.profitEstimatePerUnit}</p>
                </div>

                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-500">Demand & Market Trend</span>
                  <p className="text-base font-bold text-brand-moss dark:text-white">{aiAnalysis.demandLevel} • {aiAnalysis.priceForecastTrend}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-500/30 bg-slate-500/5 space-y-1 md:col-span-2 lg:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-brand-earth">AI Summary Reasoning</span>
                  <p className="text-xs text-brand-earth dark:text-slate-300 leading-relaxed">{aiAnalysis.summaryReasoning}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab 4: Compare Mandis */}
      {activeTab === 'compare' && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-moss dark:text-white">Side-by-Side APMC Mandi Comparison</h3>
              <p className="text-xs text-brand-earth">Compare prices, arrivals, and demand across multiple timber yards.</p>
            </div>
            {comparedMandiIds.length > 0 && (
              <button
                onClick={() => setComparedMandiIds([])}
                className="text-xs text-rose-500 font-bold hover:underline"
              >
                Clear Comparison
              </button>
            )}
          </div>

          {comparedMandiIds.length === 0 ? (
            <div className="p-12 text-center text-brand-earth border rounded-2xl">
              <Info className="w-10 h-10 text-brand-sage/40 mx-auto mb-2" />
              <p className="text-xs font-bold">No Mandis selected for comparison.</p>
              <p className="text-[11px] text-brand-earth mt-1">Go to the 'Live Mandi Rates' tab and check the 'Compare' box on up to 3 Mandis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mandiData.filter(m => comparedMandiIds.includes(m.id)).map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-brand-sage/30 bg-brand-sage/5 space-y-3 relative">
                  <button
                    onClick={() => toggleCompare(m.id)}
                    className="absolute top-3 right-3 text-brand-earth hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h4 className="font-bold text-base text-brand-moss dark:text-white">{m.mandiName}</h4>
                  <span className="text-xs font-bold text-brand-sage block">{m.district}, {m.state}</span>
                  
                  <div className="space-y-1.5 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-brand-earth">Commodity:</span>
                      <span className="font-bold">{m.commodity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-earth">Modal Price:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{m.modalPrice.toLocaleString('en-IN')} / {m.quantityUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-earth">Price Range:</span>
                      <span className="font-semibold">₹{m.minPrice.toLocaleString()} - ₹{m.maxPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-earth">Arrival Quantity:</span>
                      <span className="font-semibold">{m.arrivalQuantity} {m.quantityUnit}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-earth">Weekly Trend:</span>
                      <span className="font-bold text-emerald-500">{m.weeklyTrend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-earth">Demand Level:</span>
                      <span className="font-bold text-amber-500">{m.demandLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Set Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePriceAlert} className="bg-white dark:bg-brand-darkcard p-6 rounded-3xl max-w-md w-full space-y-4 border border-brand-clay shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-brand-moss dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Create Mandi Price Alert
              </h3>
              <button type="button" onClick={() => setShowAlertModal(false)} className="text-brand-earth hover:text-brand-moss">
                <X className="w-5 h-5" />
              </button>
            </div>

            {alertSuccess ? (
              <div className="p-4 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Mandi Price Alert Rule Created Successfully!
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth">Timber Species</label>
                  <select
                    value={alertTargetCommodity}
                    onChange={(e) => setAlertTargetCommodity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none"
                  >
                    {SPECIES_LIST.filter(s => s !== 'All').map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth">Notify Me When Price Exceeds (₹)</label>
                  <input
                    type="number"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAlertModal(false)} className="px-4 py-2 text-xs font-bold text-brand-earth">
                    Cancel
                  </button>
                  <button type="submit" className="bg-brand-moss text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-brand-sage transition-all">
                    Save Price Alert
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
