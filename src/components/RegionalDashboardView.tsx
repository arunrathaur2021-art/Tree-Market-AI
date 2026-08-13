import React, { useState, useEffect } from 'react';
import {
  MapPin, Compass, Building2, TreeDeciduous, ShoppingBag, Truck, ShieldCheck,
  TrendingUp, Sparkles, Navigation, CloudSun, DollarSign, AlertCircle, Bell,
  ChevronRight, ExternalLink, RefreshCw, ArrowUpRight, ArrowDownRight, Layers,
  Phone, MessageSquare, CheckCircle2, Filter, Eye, Star
} from 'lucide-react';
import { useRegion } from '../context/RegionContext';
import { REGIONAL_SCHEMES_DATA, getEstimatedLocationCoords, calculateDistanceKm, parseGpsCoords } from '../data/indiaLocations';
import { Tree, Business, User } from '../types';

interface RegionalDashboardViewProps {
  user: User | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
}

export default function RegionalDashboardView({ user, darkMode, setView }: RegionalDashboardViewProps) {
  const { selectedRegion, openRegionModal } = useRegion();

  const [trees, setTrees] = useState<Tree[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMapFilter, setActiveMapFilter] = useState<'all' | 'trees' | 'businesses' | 'mandis'>('all');

  // Regional Price State
  const [selectedSpeciesPrice, setSelectedSpeciesPrice] = useState<string>('Poplar');

  useEffect(() => {
    fetchRegionalData();
  }, [selectedRegion.state, selectedRegion.district]);

  const fetchRegionalData = async () => {
    setLoading(true);
    try {
      // Fetch trees filtered by region
      const treeRes = await fetch(`/api/trees?state=${encodeURIComponent(selectedRegion.state)}&district=${encodeURIComponent(selectedRegion.district)}`);
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setTrees(treeData);
      }

      // Fetch businesses filtered by region
      const bizRes = await fetch(`/api/businesses?state=${encodeURIComponent(selectedRegion.state)}&district=${encodeURIComponent(selectedRegion.district)}`);
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusinesses(bizData);
      }
    } catch (err) {
      console.error("Failed to load regional dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };
  const schemeInfo = REGIONAL_SCHEMES_DATA[(selectedRegion.state || "Haryana").toLowerCase()] || REGIONAL_SCHEMES_DATA["haryana"];

  // Mock regional price ticker data for selected state
  const regionalPrices = [
    { species: 'Poplar (G-48)', priceCft: '₹1,250 - ₹1,420', trend: '+4.2%', isUp: true, demand: 'High' },
    { species: 'Teak (Sagwan Grade A)', priceCft: '₹3,200 - ₹4,800', trend: '+2.8%', isUp: true, demand: 'Very High' },
    { species: 'Eucalyptus (Clonal)', priceCft: '₹850 - ₹980', trend: '-1.1%', isUp: false, demand: 'Moderate' },
    { species: 'Sheesham (Rosewood)', priceCft: '₹2,600 - ₹3,100', trend: '+5.0%', isUp: true, demand: 'High' },
    { species: 'Mahogany', priceCft: '₹2,100 - ₹2,550', trend: '+1.5%', isUp: true, demand: 'Moderate' },
    { species: 'Mango Wood', priceCft: '₹620 - ₹750', trend: '0.0%', isUp: true, demand: 'Stable' }
  ];

  const regionCenter = { lat: selectedRegion.lat || 30.1290, lng: selectedRegion.lng || 77.2952 };

  return (
    <div className="space-y-8">
      {/* Regional Hero Command Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
        darkMode ? 'bg-gradient-to-br from-emerald-950 via-brand-darkcard to-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border-emerald-700 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> Active Regional Zone
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                Live Mandi & Forest Intelligence
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight">
              {selectedRegion.street || selectedRegion.village || selectedRegion.district}, <span className="text-emerald-400">{selectedRegion.state}</span>
            </h1>

            {selectedRegion.fullAddress ? (
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-emerald-500/30">
                📍 <span className="font-bold text-emerald-300">Saved Address:</span> {selectedRegion.fullAddress}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                District Hierarchy: <span className="font-bold text-white">{selectedRegion.country}</span> → <span className="font-bold text-white">{selectedRegion.state}</span> → <span className="font-bold text-white">{selectedRegion.district}</span> → <span className="font-bold text-white">{selectedRegion.taluka}</span> → <span className="font-bold text-white">{selectedRegion.village}</span> ({selectedRegion.pincode})
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={openRegionModal}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <MapPin className="w-4 h-4 stroke-[2.5]" /> Change Region
            </button>
          </div>
        </div>
      </div>

      {/* Regional Quick Stats & Live Weather Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Weather Card */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Weather</span>
            <span className="text-sm font-extrabold text-amber-400">29°C Clear</span>
            <span className="text-[10px] text-slate-400 block">Ideal Timber Logging</span>
          </div>
        </div>

        {/* Trees listed in region */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <TreeDeciduous className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Trees for Sale</span>
            <span className="text-sm font-extrabold text-emerald-400">{trees.length} Listings</span>
            <span className="text-[10px] text-slate-400 block">In {selectedRegion.district}</span>
          </div>
        </div>

        {/* Businesses in region */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Wood Industries</span>
            <span className="text-sm font-extrabold text-blue-400">{businesses.length} Partners</span>
            <span className="text-[10px] text-slate-400 block">Sawmills & Plywood</span>
          </div>
        </div>

        {/* Mandis in region */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Nearby Mandis</span>
            <span className="text-sm font-extrabold text-purple-400">{schemeInfo.mandis.length} Active</span>
            <span className="text-[10px] text-slate-400 block">{schemeInfo.mandis[0]}</span>
          </div>
        </div>
      </div>

      {/* Regional Mandi Tree Prices Section */}
      <div className={`p-6 rounded-2xl border space-y-4 shadow-lg ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold font-serif flex items-center gap-2 text-emerald-400">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Today's Tree Rates in {selectedRegion.state}
            </h2>
            <p className="text-xs text-slate-400">Real-time timber prices updated daily across regional Mandis.</p>
          </div>

          <button
            onClick={() => setView('mandi')}
            className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
          >
            Full Mandi Directory <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {regionalPrices.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-brand-darkgreen/60 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-200 block">{item.species}</span>
                <span className="text-xs text-emerald-400 font-extrabold">{item.priceCft} / CFT</span>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold flex items-center justify-end gap-0.5 ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {item.trend}
                </span>
                <span className="text-[10px] text-slate-400 block">Demand: {item.demand}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Maps Centered on Region */}
      <div className={`p-6 rounded-2xl border space-y-4 shadow-lg ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-serif flex items-center gap-2 text-emerald-400">
              <Navigation className="w-5 h-5 text-emerald-400" /> Interactive Regional Map
            </h2>
            <p className="text-xs text-slate-400">
              Centered on {selectedRegion.district}, {selectedRegion.state} ({regionCenter.lat.toFixed(4)}, {regionCenter.lng.toFixed(4)})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMapFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                activeMapFilter === 'all' ? 'bg-emerald-600 text-white border-emerald-500' : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              All Pins
            </button>
            <button
              onClick={() => setActiveMapFilter('trees')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                activeMapFilter === 'trees' ? 'bg-emerald-600 text-white border-emerald-500' : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              🌳 Trees
            </button>
            <button
              onClick={() => setActiveMapFilter('businesses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                activeMapFilter === 'businesses' ? 'bg-emerald-600 text-white border-emerald-500' : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              💼 Wood Mills
            </button>
          </div>
        </div>

        {/* Embedded Map Visual Canvas */}
        <div className="relative h-80 rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-950 flex items-center justify-center">
          <iframe
            title="Google Map Regional View"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://maps.google.com/maps?q=${regionCenter.lat},${regionCenter.lng}&z=12&output=embed`}
            className="w-full h-full opacity-85 hover:opacity-100 transition-opacity"
          />

          {/* Floating Navigation Pill */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${regionCenter.lat},${regionCenter.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
          >
            <Navigation className="w-4 h-4" /> Open Navigation Directions
          </a>
        </div>
      </div>

      {/* Regional Government Schemes & Subsidies */}
      <div className={`p-6 rounded-2xl border space-y-4 shadow-lg ${
        darkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-200'
      }`}>
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <h2 className="text-lg font-bold font-serif text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Agroforestry Schemes & Transit Rules in {selectedRegion.state}
          </h2>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
            Govt Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schemeInfo.schemes.map((s, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-2 ${
                darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-400">{s.name}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md">
                  {s.subsidy}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Market Analysis for Selected Region */}
      <div className={`p-6 rounded-2xl border space-y-3 ${
        darkMode ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-100' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
          <Sparkles className="w-5 h-5" /> AI Market Intelligence for {selectedRegion.district}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Based on current industrial plywood mill logs, Poplar and Eucalyptus logs in {selectedRegion.district} are trading at optimal high-demand tiers. Demand for Grade A Poplar (24"+ girth) is up 4.2% month-over-month. Farmers in {selectedRegion.taluka} are advised to sell harvest-ready trees before monsoon season.
        </p>
      </div>

      {/* Nearby Trees Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-slate-200 flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-emerald-400" /> Trees Listed in {selectedRegion.district} & Nearby
          </h2>
          <button
            onClick={() => setView('browse')}
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Browse All Marketplace <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {trees.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'}`}>
            <TreeDeciduous className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold">No trees listed in {selectedRegion.district} yet</h3>
            <p className="text-xs text-slate-400 mt-1">Be the first farmer to list trees for sale in this region!</p>
            <button
              onClick={() => setView('seller-dashboard')}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + Add Tree Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trees.slice(0, 3).map((t) => (
              <div
                key={t.id}
                onClick={() => setView('details', { id: t.id })}
                className={`p-4 rounded-2xl border space-y-3 cursor-pointer hover:border-emerald-500 transition-colors ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-200'
                }`}
              >
                <div className="h-32 rounded-xl overflow-hidden bg-slate-800">
                  <img
                    src={t.images?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-1">{t.name}</h3>
                  <p className="text-xs text-emerald-400 font-extrabold mt-0.5">₹{t.price?.toLocaleString() || t.expectedPrice?.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {t.district || selectedRegion.district}, {t.state || selectedRegion.state}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Developer Footer */}
      <div className="text-center pt-4 text-xs text-slate-500 border-t border-slate-800">
        © 2026 TreeMarket AI India. All Rights Reserved. Designed & Developed by <span className="font-bold text-slate-300">Arun Rathaur</span>
      </div>
    </div>
  );
}
