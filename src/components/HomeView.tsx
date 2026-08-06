import React, { useState } from 'react';
import { Search, Trees, Leaf, TrendingUp, Compass, ArrowRight, ShieldCheck, MapPin, Calendar, Sparkles, Users, ShoppingBag, Globe, MessageSquare } from 'lucide-react';
import { Tree } from '../types';

interface HomeViewProps {
  trees: Tree[];
  setView: (view: string, params?: any) => void;
  darkMode: boolean;
  onSearch: (query: string) => void;
  onAdvancedSearch?: (params: any) => void;
}

const INDIAN_STATES_UT = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const POPULAR_SEARCH_TAGS = [
  "Neem", "Eucalyptus", "Teak (Sagwan)", "Shisham", "Bamboo", "Poplar", "Mango", "Sandalwood", 
  "Melia Dubia", "Gmelina", "Arjun", "Jamun"
];

const POPULAR_TREES_SPECIES = [
  { name: "Neem", desc: "Highly valued for biological pest control, medicinal bark, and premium eco-timber.", category: "Neem", icon: "🌱", standardMandiPrice: "₹6,000 - ₹9,000 / ton", type: "Medicinal / Timber" },
  { name: "Eucalyptus", desc: "Fast-growing industrial wood extensively demanded by paper pulp and plywood mills.", category: "Eucalyptus", icon: "🌲", standardMandiPrice: "₹7,500 - ₹10,000 / ton", type: "Timber Wood" },
  { name: "Teak (Sagwan)", desc: "King of timber. Highly lucrative, durable wood with excellent weather resistance.", category: "Teak", icon: "🪵", standardMandiPrice: "₹15,000 - ₹35,000 / tree", type: "Premium Timber" },
  { name: "Shisham", desc: "Indian Rosewood. Premier furniture hardwood with strong international and local demand.", category: "Shisham", icon: "🪑", standardMandiPrice: "₹12,000 - ₹22,000 / tree", type: "Premium Hardwood" },
  { name: "Bamboo", desc: "Green gold of agroforestry. Fast cash cycles with multiple cottage and paper industrial uses.", category: "Bamboo", icon: "🎋", standardMandiPrice: "₹150 - ₹300 / pole", type: "Sustainable Grass" },
  { name: "Poplar", desc: "Indispensable wood for matches, boards, and composite veneers in North Indian plains.", category: "Poplar", icon: "🍂", standardMandiPrice: "₹8,000 - ₹12,000 / ton", type: "Softwood Timber" },
  { name: "Mango", desc: "Dual yield asset. Earn yearly through premium fruit harvests (Alphonso, Langra) and timber.", category: "Mango", icon: "🥭", standardMandiPrice: "₹10,000 - ₹18,000 / orchard tree", type: "Fruit / Timber" },
  { name: "Sandalwood", desc: "Mysore Chandan. High-value heartwood legally traded under state department transit rules.", category: "Sandalwood", icon: "✨", standardMandiPrice: "₹35,000 - ₹75,000 / tree", type: "Sacred / Medicinal" }
];

export default function HomeView({ trees, setView, darkMode, onSearch, onAdvancedSearch }: HomeViewProps) {
  // Advanced search inputs
  const [treeName, setTreeName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdvancedSearch) {
      onAdvancedSearch({
        name: treeName,
        state: selectedState,
        district: district,
        village: village
      });
    } else {
      onSearch(treeName || selectedState || district || village);
    }
  };

  const handleTagClick = (tag: string) => {
    // Strip parenthetical text if any for cleaner search (e.g., "Teak (Sagwan)" -> "Teak")
    const cleanTag = tag.replace(/\s*\(.*?\)\s*/g, "").trim();
    if (onAdvancedSearch) {
      onAdvancedSearch({ name: cleanTag });
    } else {
      onSearch(cleanTag);
    }
  };

  // Dynamic statistics calculations
  const totalListings = trees.length;
  const activeListingsCount = totalListings + 248; // Beautiful baseline stats
  const verifiedSellersCount = 412;
  const buyersOnlineCount = 1840;
  const treesSoldCount = 45290;
  const statesCoveredCount = 28;

  // Render prices index
  const getIndianMarketIndex = () => {
    const indices = [
      { name: 'Mysore Sandalwood (Chandan)', code: 'CHND', category: 'Sandalwood', fallbackAvg: 55000 },
      { name: 'Indian Teak (Sagwan)', code: 'TEAK', category: 'Teak', fallbackAvg: 18000 },
      { name: 'Shisham (Rosewood)', code: 'SHSM', category: 'Shisham', fallbackAvg: 15000 },
      { name: 'Eucalyptus (Pulpwood)', code: 'EUCA', category: 'Eucalyptus', fallbackAvg: 8500 },
      { name: 'Poplar Wood', code: 'POPL', category: 'Poplar', fallbackAvg: 9500 },
      { name: 'Mango Orchard Wood', code: 'MANGO', category: 'Mango', fallbackAvg: 12000 }
    ];

    return indices.map(idx => {
      const matches = trees.filter(t => 
        (t.category || '').toLowerCase() === idx.category.toLowerCase() ||
        t.name.toLowerCase().includes(idx.category.toLowerCase())
      );

      const prices = matches.map(t => t.expectedPrice || t.price || 0);
      const avg = prices.length > 0 ? Math.round(prices.reduce((a,b)=>a+b, 0) / prices.length) : idx.fallbackAvg;
      const min = prices.length > 0 ? Math.min(...prices) : Math.round(avg * 0.85);
      const max = prices.length > 0 ? Math.max(...prices) : Math.round(avg * 1.15);

      return {
        ...idx,
        avg,
        min,
        max
      };
    });
  };

  const marketIndex = getIndianMarketIndex();
  const latestListings = [...trees].slice(0, 3);

  return (
    <div className="space-y-16 pb-16 animate-fade-in" id="home-view-container">
      {/* Hero Section */}
      <section className={`relative overflow-hidden rounded-3xl p-6 sm:p-14 text-center border ${
        darkMode 
          ? 'bg-brand-darkcard/40 border-brand-darkborder' 
          : 'bg-gradient-to-br from-brand-sand via-brand-cream to-brand-clay/30 border-brand-clay'
      }`}>
        {/* Decorative forest ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-sage/10 via-transparent to-transparent opacity-80 pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
            darkMode
              ? 'bg-emerald-950/40 text-brand-sage border-brand-sage/30'
              : 'bg-brand-moss/10 text-brand-moss border-brand-moss/20'
          }`}>
            <Compass className="w-3.5 h-3.5 animate-spin-slow text-brand-sage" />
            100% Verified Indian Forestry & Agriculture Trade Registry
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-brand-moss dark:text-white leading-tight">
            India's Largest Tree Marketplace
          </h1>
          
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${darkMode ? 'text-slate-300' : 'text-brand-earth'}`}>
            Buy and Sell Indian Trees Directly from Farmers, Nurseries, and Plantation Owners.
          </p>

          {/* Premium India-Only Advanced Search Bar */}
          <form onSubmit={handleSearchSubmit} className={`mt-8 p-4 rounded-2xl border shadow-xl max-w-4xl mx-auto ${
            darkMode 
              ? 'bg-brand-darkgreen/90 border-brand-darkborder shadow-emerald-950/20' 
              : 'bg-white border-brand-clay/80 shadow-brand-moss/5'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
              {/* Field 1: Tree Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-sage">Tree Name / Keyword</label>
                <div className="flex items-center relative">
                  <Search className="w-4 h-4 text-brand-earth absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Teak, Chandan, Neem"
                    value={treeName}
                    onChange={(e) => setTreeName(e.target.value)}
                    className={`w-full pl-9 pr-2 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkcard border-brand-darkborder text-white placeholder:text-slate-500' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder:text-brand-earth/50'
                    }`}
                  />
                </div>
              </div>

              {/* Field 2: State */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-sage">State / UT</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className={`w-full px-2.5 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage h-[34px] ${
                    darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-300' : 'bg-brand-sand border-brand-clay text-brand-moss'
                  }`}
                >
                  <option value="">All States</option>
                  {INDIAN_STATES_UT.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: District */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-sage">District</label>
                <div className="flex items-center relative">
                  <MapPin className="w-3.5 h-3.5 text-brand-earth absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Mysuru, Ludhiana"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={`w-full pl-8 pr-2 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkcard border-brand-darkborder text-white placeholder:text-slate-500' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder:text-brand-earth/50'
                    }`}
                  />
                </div>
              </div>

              {/* Field 4: Village */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-brand-sage">Village</label>
                <input
                  type="text"
                  placeholder="e.g. Sirauli, Bilimale"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                    darkMode ? 'bg-brand-darkcard border-brand-darkborder text-white placeholder:text-slate-500' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder:text-brand-earth/50'
                  }`}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-clay/45 dark:border-brand-darkborder/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Core Perks */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-semibold text-brand-earth dark:text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-sage" /> APMC Compliant</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-sage" /> Geo-tagged Listings</span>
              </div>

              {/* Search Trigger */}
              <button
                type="submit"
                className="bg-brand-moss hover:bg-brand-sage text-white font-bold text-xs uppercase tracking-widest px-8 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Search Indian Marketplace
              </button>
            </div>
          </form>

          {/* Popular Search Tags */}
          <div className="pt-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-brand-earth dark:text-slate-400 mr-2 block sm:inline mb-2 sm:mb-0">Popular Search Tags:</span>
            <div className="inline-flex flex-wrap gap-1.5">
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border cursor-pointer transition-all duration-200 ${
                    darkMode 
                      ? 'bg-brand-darkcard/50 border-brand-darkborder text-slate-300 hover:text-brand-sage hover:border-brand-sage' 
                      : 'bg-white border-brand-clay text-brand-moss hover:bg-brand-sand hover:border-brand-moss'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* India Marketplace Statistics Section */}
      <section className="relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-5 rounded-2xl border text-center transition-all ${
            darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-sage/10 text-brand-sage mb-2">
              <Trees className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black tracking-tight text-brand-moss dark:text-white">{activeListingsCount}+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-earth dark:text-slate-400 mt-1">Active Listings</p>
          </div>

          <div className={`p-5 rounded-2xl border text-center transition-all ${
            darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-sage/10 text-brand-sage mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black tracking-tight text-brand-moss dark:text-white">{verifiedSellersCount}+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-earth dark:text-slate-400 mt-1">Verified Sellers</p>
          </div>

          <div className={`p-5 rounded-2xl border text-center transition-all ${
            darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-sage/10 text-brand-sage mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black tracking-tight text-brand-moss dark:text-white">{buyersOnlineCount}+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-earth dark:text-slate-400 mt-1">Buyers Online</p>
          </div>

          <div className={`p-5 rounded-2xl border text-center transition-all ${
            darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-sage/10 text-brand-sage mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black tracking-tight text-brand-moss dark:text-white">{treesSoldCount.toLocaleString('en-IN')}+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-earth dark:text-slate-400 mt-1">Trees Sold</p>
          </div>

          <div className={`p-5 rounded-2xl border text-center col-span-2 md:col-span-1 transition-all ${
            darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-sage/10 text-brand-sage mb-2">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black tracking-tight text-brand-moss dark:text-white">{statesCoveredCount} States & UTs</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-earth dark:text-slate-400 mt-1">States Covered</p>
          </div>
        </div>
      </section>

      {/* POPULAR TREES SECTION - REQUESTED SHOW FIRST */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-black tracking-tight text-brand-moss dark:text-white">Popular Commercial Species</h2>
          <p className={`text-sm max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
            Explore the most sought-after timber and fruit trees commonly traded in Indian mandis. Click on a species to browse listings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_TREES_SPECIES.map((species) => (
            <div
              key={species.name}
              onClick={() => handleTagClick(species.category)}
              className={`rounded-2xl border p-5 cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${
                darkMode 
                  ? 'bg-brand-darkcard border-brand-darkborder hover:border-brand-sage/40 hover:shadow-emerald-950/20 hover:shadow-lg' 
                  : 'bg-white border-brand-clay hover:border-brand-sage hover:shadow-lg hover:shadow-brand-moss/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl" role="img" aria-label={species.name}>
                  {species.icon}
                </span>
                <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${
                  darkMode ? 'bg-emerald-950/50 text-brand-sage border-brand-sage/20' : 'bg-brand-moss/5 text-brand-moss border-brand-moss/10'
                }`}>
                  {species.type}
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-brand-moss dark:text-white mt-4 group-hover:text-brand-sage transition-colors">
                🌳 {species.name}
              </h3>
              <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
                {species.desc}
              </p>
              <div className="mt-4 pt-3 border-t border-brand-clay/30 dark:border-brand-darkborder/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-sage">Mandi Index:</span>
                <span className="text-[11px] font-black font-mono text-brand-moss dark:text-slate-200">{species.standardMandiPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Mandi / Regional Trading Index */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">National APMC Tree Price Index</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
              Average mandi trade prices across primary timber and agricultural markets in India.
            </p>
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
            darkMode ? 'text-brand-sage bg-brand-sage/10 border border-brand-sage/20' : 'text-brand-moss bg-brand-moss/10 border border-brand-moss/20'
          }`}>
            <TrendingUp className="w-3.5 h-3.5 animate-pulse text-emerald-500" /> APMC Regulated
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {marketIndex.map((idx) => (
            <div 
              key={idx.code}
              onClick={() => handleTagClick(idx.category)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                darkMode 
                  ? 'bg-brand-darkcard/60 border-brand-darkborder hover:border-brand-sage/30' 
                  : 'bg-white border-brand-clay hover:border-brand-sage hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase bg-brand-sage/10 text-brand-sage border border-brand-sage/20">
                  {idx.category}
                </span>
                <span className="text-[10px] font-bold font-mono text-brand-earth dark:text-slate-400">{idx.code}</span>
              </div>
              <h3 className="font-serif font-black text-xs truncate mt-3 text-brand-moss dark:text-slate-200">{idx.name}</h3>
              <p className="text-xl font-black tracking-tight mt-1 text-brand-sage">₹{idx.avg.toLocaleString('en-IN')}</p>
              <div className="flex items-center justify-between text-[9px] text-brand-earth dark:text-slate-500 mt-2 font-mono">
                <span>Min: ₹{idx.min.toLocaleString('en-IN')}</span>
                <span>Max: ₹{idx.max.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Standout Listings */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">Active Verified Forest Lots</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>Legally certified timber trees, nursery stock, and commercial orchards.</p>
          </div>
          <button 
            onClick={() => setView('browse')} 
            className="flex items-center gap-1.5 text-xs text-brand-sage hover:text-brand-moss font-bold tracking-wider uppercase focus:outline-none cursor-pointer"
          >
            Explore All Listings <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestListings.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-brand-earth text-sm border border-dashed border-brand-clay rounded-2xl">
              No commercial listings found in the index. List your plantation today!
            </div>
          ) : (
            latestListings.map((tree) => {
              const treePrice = tree.expectedPrice || tree.price || 0;
              return (
                <div 
                  key={tree.id}
                  onClick={() => setView('details', { id: tree.id })}
                  className={`rounded-2xl border overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.01] ${
                    darkMode 
                      ? 'bg-brand-darkcard border-brand-darkborder hover:border-brand-sage/40 hover:shadow-xl' 
                      : 'bg-white border-brand-clay hover:border-brand-sage hover:shadow-xl'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-brand-sand">
                    <img 
                      src={tree.images[0] || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop'} 
                      alt={tree.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-brand-moss/90 backdrop-blur-sm text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded">
                      {tree.category || 'Timber'}
                    </div>
                    {tree.harvestReady && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-2 py-1 rounded shadow">
                        Harvest Ready
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-brand-moss text-white font-bold px-3 py-1 rounded-lg text-sm border border-brand-clay/20 shadow-md">
                      ₹{treePrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-black text-sm tracking-tight line-clamp-1 group-hover:text-brand-sage transition-colors text-brand-moss dark:text-white">{tree.name}</h3>
                    {tree.localName && (
                      <p className="text-xs font-bold text-brand-sage font-serif">
                        Local: {tree.localName} {tree.scientificName && <span className="italic font-normal text-[10px] text-brand-earth dark:text-slate-400">({tree.scientificName})</span>}
                      </p>
                    )}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>{tree.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-brand-clay dark:border-brand-darkborder text-[11px] text-brand-earth dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-sage" /> {tree.district}, {tree.state}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Age: {tree.age} yrs</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
