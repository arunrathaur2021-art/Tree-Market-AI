import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Leaf, Calendar, Sparkles, AlertCircle, RefreshCw, Eye, ShieldCheck, Tag, MessageSquare } from 'lucide-react';
import { Tree } from '../types';

interface BrowseViewProps {
  trees: Tree[];
  setView: (view: string, params?: any) => void;
  darkMode: boolean;
  initialQuery?: string;
  initialParams?: any;
}

const INDIAN_STATES_UT = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Strictly India commonly grown, sold, or traded species categories
const TREE_CATEGORIES = [
  "Teak (Sagwan)", "Sandalwood", "Eucalyptus", "Shisham", "Bamboo", "Poplar", "Mango", "Melia Dubia", 
  "Gmelina", "Silver Oak", "Casuarina", "Acacia", "Sal", "Arjun", "Neem", "Karanj", "Guava", "Coconut", 
  "Jamun", "Lemon", "Orange", "Amla", "Tamarind", "Jackfruit", "Banana", "Litchi", "Ashoka", "Bael", 
  "Moringa", "Peepal", "Banyan", "Timber Trees", "Fruit Trees", "Medicinal Trees", "Sacred Trees"
];

export default function BrowseView({ trees, setView, darkMode, initialQuery = '', initialParams }: BrowseViewProps) {
  // Filters initialized with initialParams if available
  const [search, setSearch] = useState(initialParams?.name || initialQuery || '');
  const [categoryFilter, setCategoryFilter] = useState(initialParams?.category || '');
  const [minPrice, setMinPrice] = useState(initialParams?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialParams?.maxPrice || '');
  const [stateFilter, setStateFilter] = useState(initialParams?.state || '');
  const [districtFilter, setDistrictFilter] = useState(initialParams?.district || '');
  const [villageFilter, setVillageFilter] = useState(initialParams?.village || '');
  const [pincodeFilter, setPincodeFilter] = useState(initialParams?.pincode || '');
  const [harvestReadyFilter, setHarvestReadyFilter] = useState(initialParams?.harvestReady || '');

  // Synchronize with home search triggers
  useEffect(() => {
    if (initialParams) {
      setSearch(initialParams.name || '');
      setCategoryFilter(initialParams.category || '');
      setStateFilter(initialParams.state || '');
      setDistrictFilter(initialParams.district || '');
      setVillageFilter(initialParams.village || '');
      setPincodeFilter(initialParams.pincode || '');
      setMinPrice(initialParams.minPrice || '');
      setMaxPrice(initialParams.maxPrice || '');
      setHarvestReadyFilter(initialParams.harvestReady || '');
    } else if (initialQuery) {
      setSearch(initialQuery);
    }
  }, [initialParams, initialQuery]);

  // Find category-wide minimum prices among all trees to determine "Best Price" badge
  const categoryMinPrices = React.useMemo(() => {
    const mins: { [key: string]: number } = {};
    trees.forEach((t) => {
      const cat = (t.category || '').toLowerCase().trim();
      const price = t.expectedPrice || t.price || 0;
      if (!mins[cat] || price < mins[cat]) {
        mins[cat] = price;
      }
    });
    return mins;
  }, [trees]);

  // Filter listings
  const filteredTrees = trees.filter((tree) => {
    const treePrice = tree.expectedPrice || tree.price || 0;
    
    // Keyword match
    if (search) {
      const q = search.toLowerCase().trim();
      const matches = 
        tree.name.toLowerCase().includes(q) ||
        (tree.localName || '').toLowerCase().includes(q) ||
        (tree.scientificName || '').toLowerCase().includes(q) ||
        (tree.species || '').toLowerCase().includes(q) ||
        tree.description.toLowerCase().includes(q) ||
        (tree.category || '').toLowerCase().includes(q) ||
        tree.state.toLowerCase().includes(q) ||
        tree.district.toLowerCase().includes(q) ||
        (tree.village || '').toLowerCase().includes(q) ||
        tree.pincode.includes(q);
      if (!matches) return false;
    }

    // Category Filter (support fuzzy matches like "Teak" matching "Teak (Sagwan)")
    if (categoryFilter) {
      const filterCat = categoryFilter.toLowerCase();
      const treeCat = (tree.category || '').toLowerCase();
      const nameMatch = tree.name.toLowerCase().includes(filterCat);
      const categoryMatch = treeCat.includes(filterCat) || filterCat.includes(treeCat);
      if (!categoryMatch && !nameMatch) return false;
    }

    // Expected Price
    if (minPrice && treePrice < Number(minPrice)) return false;
    if (maxPrice && treePrice > Number(maxPrice)) return false;

    // Location State
    if (stateFilter && tree.state.toLowerCase() !== stateFilter.toLowerCase()) {
      return false;
    }

    // Location District
    if (districtFilter) {
      const q = districtFilter.toLowerCase().trim();
      if (!tree.district.toLowerCase().includes(q)) return false;
    }

    // Location Village
    if (villageFilter) {
      const q = villageFilter.toLowerCase().trim();
      if (!(tree.village || '').toLowerCase().includes(q)) return false;
    }

    // Pincode
    if (pincodeFilter) {
      const q = pincodeFilter.trim();
      if (!tree.pincode.includes(q)) return false;
    }

    // Harvest Ready
    if (harvestReadyFilter) {
      const isRdy = harvestReadyFilter === 'true';
      if (tree.harvestReady !== isRdy) return false;
    }

    return true;
  });

  const handleReset = () => {
    setSearch('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
    setStateFilter('');
    setDistrictFilter('');
    setVillageFilter('');
    setPincodeFilter('');
    setHarvestReadyFilter('');
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in" id="browse-catalog-container">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">
          Indian Commercial Tree Marketplace
        </h1>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
          Direct buy, sell, and negotiation platform for certified Indian timber species, farm woodlands, and fruit orchards.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Advanced Filters Sidebar */}
        <aside className={`w-full lg:w-72 flex-shrink-0 p-6 rounded-2xl border space-y-6 self-start ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-brand-clay dark:border-brand-darkborder">
            <h2 className="font-serif font-bold text-sm tracking-tight flex items-center gap-2 text-brand-moss dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-brand-sage" /> Filters
            </h2>
            <button
              onClick={handleReset}
              className="text-xs text-brand-earth hover:text-brand-sage font-semibold cursor-pointer focus:outline-none flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset All
            </button>
          </div>

          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">Search Listings</label>
            <div className={`flex items-center px-3 py-2 rounded-xl border text-sm ${
              darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
            }`}>
              <Search className="w-4 h-4 text-brand-earth mr-2" />
              <input
                type="text"
                placeholder="Name, Local Name, Pincode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-brand-earth/50 text-brand-moss dark:text-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Tree Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">Tree Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            >
              <option value="">All Categories</option>
              {TREE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range (INR) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">Expected Price (₹)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
                }`}
              />
              <span className="text-brand-earth text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
                }`}
              />
            </div>
          </div>

          {/* Indian State Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">State / UT</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            >
              <option value="">All India</option>
              {INDIAN_STATES_UT.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">District</label>
            <input
              type="text"
              placeholder="e.g. Mysuru, Ludhiana"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            />
          </div>

          {/* Village Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">Village</label>
            <input
              type="text"
              placeholder="e.g. Mushkabad, Sirauli"
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            />
          </div>

          {/* Pincode Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">Pincode (6-digits)</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 141001"
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            />
          </div>

          {/* Harvest Ready status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-earth dark:text-slate-400">Harvest Status</label>
            <select
              value={harvestReadyFilter}
              onChange={(e) => setHarvestReadyFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
              }`}
            >
              <option value="">Any Status</option>
              <option value="true">Harvest Ready (Timber)</option>
              <option value="false">Sapling / Growth Stage</option>
            </select>
          </div>
        </aside>

        {/* Listings Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-brand-earth dark:text-slate-400">
            <span>Showing {filteredTrees.length} listings in India</span>
            <span>Sorted by Latest</span>
          </div>

          {filteredTrees.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3 ${
              darkMode ? 'bg-brand-darkcard/30 border-brand-darkborder' : 'bg-white border-brand-clay'
            }`}>
              <AlertCircle className="w-10 h-10 text-brand-sage" />
              <h3 className="font-serif font-black text-base text-brand-moss dark:text-white">No listings match filters</h3>
              <p className="text-sm text-brand-earth dark:text-slate-400 max-w-sm">
                No Indian tree listings matched your specific geographical or pricing parameters. Try resetting your inputs.
              </p>
              <button 
                onClick={handleReset}
                className="bg-brand-moss hover:bg-brand-sage text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrees.map((tree) => {
                const treePrice = tree.expectedPrice || tree.price || 0;
                const isCheapest = treePrice <= (categoryMinPrices[(tree.category || '').toLowerCase().trim()] || treePrice);

                return (
                  <div
                    key={tree.id}
                    onClick={() => setView('details', { id: tree.id })}
                    className={`rounded-3xl border overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between ${
                      darkMode 
                        ? 'bg-brand-darkcard border-brand-darkborder hover:border-brand-sage/40 hover:shadow-emerald-950/10' 
                        : 'bg-white border-brand-clay/80 hover:border-brand-sage hover:shadow-brand-moss/5'
                    }`}
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-44 overflow-hidden bg-brand-sand">
                        <img
                          src={tree.images[0] || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop'}
                          alt={tree.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Best Price Badge */}
                        {isCheapest && (
                          <div className="absolute top-3 left-3 bg-brand-moss text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded shadow-md border border-brand-sage/20">
                            <Sparkles className="w-3 h-3 animate-pulse text-yellow-300 inline mr-1" />
                            Best Price
                          </div>
                        )}

                        {/* Verified Badge */}
                        <div className="absolute top-3 right-3 bg-brand-spruce/95 backdrop-blur-md text-brand-sage font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1 shadow-md border border-brand-sage/30">
                          <ShieldCheck className="w-3 h-3 text-brand-sage" />
                          Verified
                        </div>

                        {/* Category Label */}
                        <div className="absolute bottom-3 left-3 bg-brand-moss/90 backdrop-blur-sm text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-md border border-white/10">
                          {tree.category || 'Timber'}
                        </div>
                      </div>

                      {/* Content Frame */}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-serif font-black text-sm tracking-tight group-hover:text-brand-sage transition-colors text-brand-moss dark:text-white line-clamp-1">
                            {tree.name}
                          </h3>
                        </div>

                        {/* Local Taxonomic names */}
                        {tree.localName && (
                          <p className="text-[11px] font-bold text-brand-sage font-serif leading-none flex items-center gap-1">
                            <Tag className="w-3 h-3 flex-shrink-0" />
                            Local Name: <span className="text-brand-moss dark:text-slate-300">{tree.localName}</span>
                            {tree.scientificName && <span className="italic font-normal text-[10px] text-brand-earth dark:text-slate-400">({tree.scientificName})</span>}
                          </p>
                        )}

                        {/* Description */}
                        <p className={`text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
                          {tree.description}
                        </p>

                        {/* Key plantation stats */}
                        <div className={`grid grid-cols-4 gap-1 p-2 rounded-xl text-center text-[10px] font-bold ${
                          darkMode ? 'bg-brand-darkgreen/40' : 'bg-brand-sand'
                        }`}>
                          <div>
                            <span className="block text-brand-sage uppercase tracking-wider text-[8px] font-black">Age</span>
                            <span className="text-brand-moss dark:text-slate-200">{tree.age} yrs</span>
                          </div>
                          <div>
                            <span className="block text-brand-sage uppercase tracking-wider text-[8px] font-black">Height</span>
                            <span className="text-brand-moss dark:text-slate-200">{tree.height} ft</span>
                          </div>
                          <div>
                            <span className="block text-brand-sage uppercase tracking-wider text-[8px] font-black">Trunk Dia</span>
                            <span className="text-brand-moss dark:text-slate-200">{tree.diameter} in</span>
                          </div>
                          <div>
                            <span className="block text-brand-sage uppercase tracking-wider text-[8px] font-black">Stock Qty</span>
                            <span className="text-brand-moss dark:text-slate-200">{tree.quantity} units</span>
                          </div>
                        </div>

                        {/* Harvest Status tag */}
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className={`px-2 py-0.5 rounded font-black uppercase tracking-wider text-[8px] border ${
                            tree.harvestReady
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          }`}>
                            {tree.harvestReady ? 'Mature Timber' : 'Nursery Stock'}
                          </span>
                          
                          {/* AI Estimated price line */}
                          <span className="text-brand-sage font-black flex items-center gap-1 font-mono text-[9px]">
                            <Sparkles className="w-3 h-3 text-brand-sage animate-pulse" />
                            AI Est: ₹{(tree.aiEstimation?.suggestedSellingPrice || (tree.age * 1200 + tree.height * 250 + tree.diameter * 400)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Meta Frame */}
                    <div className="p-4 pt-0 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-brand-earth dark:text-slate-400 font-medium pt-3 border-t border-brand-clay dark:border-brand-darkborder">
                        <div className="truncate w-1/2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-sage flex-shrink-0" />
                          <span className="truncate">{tree.village ? `${tree.village}, ` : ''}{tree.district}, {tree.state}</span>
                        </div>
                        <div className="text-right truncate w-1/2 font-semibold text-brand-moss dark:text-slate-300">
                          Seller: {tree.sellerName.split(' ')[0]}
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {/* Price Display */}
                        <div className="text-left">
                          <span className="text-[9px] uppercase tracking-widest font-black text-brand-sage block">Expected Price</span>
                          <span className="text-sm font-serif font-black text-brand-moss dark:text-white leading-none">
                            ₹{treePrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Direct contact & details actions */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setView('chat', { partnerId: tree.sellerId, treeId: tree.id });
                            }}
                            className={`px-2.5 py-2 rounded-xl border flex items-center gap-1 transition-colors cursor-pointer ${
                              darkMode 
                                ? 'border-brand-darkborder bg-brand-darkcard hover:bg-brand-darkborder text-brand-sage' 
                                : 'border-brand-clay bg-brand-sand hover:bg-brand-clay text-brand-moss'
                            }`}
                            title="Chat with Seller"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">Chat</span>
                          </button>
                          {tree.sellerContact && (
                            <a
                              href={`tel:${tree.sellerContact}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`p-2 rounded-xl border transition-colors ${
                                darkMode 
                                  ? 'border-brand-darkborder bg-brand-darkcard hover:bg-brand-darkborder text-brand-sage' 
                                  : 'border-brand-clay bg-brand-sand hover:bg-brand-clay text-brand-moss'
                              }`}
                              title="Call Seller"
                            >
                              <span className="text-[10px] font-bold">Call</span>
                            </a>
                          )}
                          <button
                            onClick={() => setView('details', { id: tree.id })}
                            className="flex items-center gap-1 bg-brand-moss hover:bg-brand-sage text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer focus:outline-none"
                          >
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
