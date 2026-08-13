import React, { useState, useEffect, useMemo } from 'react'; import MapSafe from './MapSafe';
import { MapPin, Navigation, Filter, ArrowUpDown, Trees, MessageSquare, ExternalLink, Loader2, Search, SlidersHorizontal, Map, Grid } from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Tree, User } from '../types';
import { parseGpsCoords, calculateDistanceKm, getEstimatedLocationCoords } from '../data/indiaLocations';
import IndiaLocationSelect from './IndiaLocationSelect';

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

interface NearbyTreesViewProps {
  user: User | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
  onOpenChat: (sellerId: string, treeId: string, treeName: string) => void;
}

export default function NearbyTreesView({
  user,
  darkMode,
  setView,
  onOpenChat
}: NearbyTreesViewProps) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);

  // Buyer GPS state
  const [buyerGps, setBuyerGps] = useState<string>('20.5937, 78.9629'); // Default Central India
  const [buyerState, setBuyerState] = useState<string>(user?.state || '');
  const [buyerDistrict, setBuyerDistrict] = useState<string>(user?.district || '');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Filters
  const [radiusKm, setRadiusKm] = useState<number>(50); // Default 50 km
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'ai_price' | 'age' | 'height' | 'diameter'>('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrees();
    detectBuyerGps();
  }, []);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/trees');
      if (res.ok) {
        const data = await res.json();
        setTrees(data);
      }
    } catch (err) {
      console.error("Failed to fetch trees:", err);
    } finally {
      setLoading(false);
    }
  };

  const detectBuyerGps = () => {
    if (navigator.geolocation) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
          const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;
          setBuyerGps(`${lat}, ${lng}`);
          setDetectingLocation(false);
        },
        () => {
          setDetectingLocation(false);
        }
      );
    }
  };

  const buyerCoords = useMemo(() => {
    return parseGpsCoords(buyerGps) || getEstimatedLocationCoords(buyerState, buyerDistrict);
  }, [buyerGps, buyerState, buyerDistrict]);

  // Compute trees with distance
  const processedTrees = useMemo(() => {
    return trees.map((tree) => {
      const treeCoords = parseGpsCoords(tree.gpsLocation) || getEstimatedLocationCoords(tree.state, tree.district);
      const dist = calculateDistanceKm(buyerCoords.lat, buyerCoords.lng, treeCoords.lat, treeCoords.lng);
      return {
        ...tree,
        distanceKm: dist,
        coords: treeCoords
      };
    });
  }, [trees, buyerCoords]);

  // Filter by Radius & Search
  const filteredTrees = useMemo(() => {
    let list = processedTrees;

    if (radiusKm > 0) {
      list = list.filter(t => t.distanceKm <= radiusKm);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.species.toLowerCase().includes(q) ||
        t.district.toLowerCase().includes(q) ||
        t.state.toLowerCase().includes(q)
      );
    }

    // Sort
    return list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'price_asc') return (a.expectedPrice || a.price) - (b.expectedPrice || b.price);
      if (sortBy === 'price_desc') return (b.expectedPrice || b.price) - (a.expectedPrice || a.price);
      if (sortBy === 'ai_price') {
        const aiA = a.aiEstimation?.expectedMarketPrice || a.expectedPrice;
        const aiB = b.aiEstimation?.expectedMarketPrice || b.expectedPrice;
        return aiB - aiA;
      }
      if (sortBy === 'age') return b.age - a.age;
      if (sortBy === 'height') return b.height - a.height;
      if (sortBy === 'diameter') return b.diameter - a.diameter;
      return 0;
    });
  }, [processedTrees, radiusKm, searchQuery, sortBy]);

  const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in" id="nearby-trees-container">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-moss dark:text-white flex items-center gap-2">
            <Navigation className="w-7 h-7 text-brand-sage animate-pulse" />
            Nearby Trees Radar & Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-brand-earth">
            Find timber and standing trees near your farm or lumber yard across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'grid'
                ? 'bg-brand-moss text-white shadow'
                : darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-300' : 'bg-white border-brand-clay text-brand-moss'
            }`}
          >
            <Grid className="w-4 h-4" /> Grid List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'map'
                ? 'bg-brand-moss text-white shadow'
                : darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-300' : 'bg-white border-brand-clay text-brand-moss'
            }`}
          >
            <Map className="w-4 h-4" /> Radar Map
          </button>
        </div>
      </div>

      {/* Control Panel: GPS Location & Radius Filters */}
      <div className={`p-4 sm:p-5 rounded-2xl border mb-6 ${
        darkMode ? 'bg-brand-darkcard/50 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Location Bar */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-moss dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-sage" /> Your Buyer Center Point
              </label>
              <button
                type="button"
                onClick={detectBuyerGps}
                disabled={detectingLocation}
                className="text-[11px] font-bold text-brand-sage hover:underline flex items-center gap-1 cursor-pointer"
              >
                {detectingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                Auto Detect GPS
              </button>
            </div>
            <IndiaLocationSelect
              state={buyerState}
              district={buyerDistrict}
              onChange={(up) => {
                if (up.state !== undefined) setBuyerState(up.state);
                if (up.district !== undefined) setBuyerDistrict(up.district);
                if (up.gpsLocation) setBuyerGps(up.gpsLocation);
              }}
              darkMode={darkMode}
            />
          </div>

          {/* Radius Filter */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-brand-moss dark:text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-sage" /> Search Distance Radius
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[5, 10, 20, 50, 100, 0].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    radiusKm === r
                      ? 'bg-brand-sage text-white shadow'
                      : darkMode ? 'bg-brand-darkcard text-slate-300 border-brand-darkborder' : 'bg-brand-sand text-brand-moss border border-brand-clay/60'
                  }`}
                >
                  {r === 0 ? 'All India' : `${r} km`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort & Search */}
          <div className="lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-brand-moss dark:text-white flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-brand-sage" /> Sort Listings By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`w-full text-xs font-bold p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
              }`}
            >
              <option value="distance">Distance (Nearest First)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="ai_price">AI Valuation Estimate</option>
              <option value="age">Tree Age (Oldest First)</option>
              <option value="height">Height (Tallest First)</option>
              <option value="diameter">Trunk Diameter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map View Mode */}
      {viewMode === 'map' && (
        <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-brand-clay/60 shadow-lg mb-6 relative">
          {hasValidKey ? (
            <MapSafe><APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
              <GoogleMap
                center={buyerCoords}
                zoom={radiusKm <= 20 ? 11 : radiusKm <= 50 ? 9 : 7}
                mapId="NEARBY_TREES_RADAR_MAP"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {/* Buyer Marker */}
                <AdvancedMarker position={buyerCoords} title="Your Location">
                  <Pin background="#2563EB" glyphColor="#FFFFFF" />
                </AdvancedMarker>

                {/* Tree Markers */}
                {filteredTrees.map((tree) => (
                  <AdvancedMarker
                    key={tree.id}
                    position={tree.coords}
                    onClick={() => setView('tree-details', { treeId: tree.id })}
                  >
                    <div className="bg-brand-moss text-white px-2 py-1 rounded-lg text-[11px] font-bold shadow-md border border-white flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                      <Trees className="w-3.5 h-3.5 text-emerald-300" />
                      <span>₹{(tree.expectedPrice || tree.price).toLocaleString('en-IN')}</span>
                      <span className="text-[9px] opacity-80">({tree.distanceKm} km)</span>
                    </div>
                  </AdvancedMarker>
                ))}
              </GoogleMap>
            </APIProvider></MapSafe>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-moss/20 to-emerald-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Trees className="w-16 h-16 text-brand-sage animate-bounce mb-3" />
              <h3 className="text-xl font-serif font-bold text-white mb-1">Radar Map Visualization</h3>
              <p className="text-xs text-slate-200 max-w-md">
                Showing {filteredTrees.length} tree listings within {radiusKm === 0 ? 'All India' : `${radiusKm} km`} radius from your center point.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid List View Mode */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-earth gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-sage" />
          <p className="text-sm font-medium">Scanning nearby tree plantations...</p>
        </div>
      ) : filteredTrees.length === 0 ? (
        <div className={`text-center py-16 px-4 rounded-2xl border ${
          darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay'
        }`}>
          <Trees className="w-12 h-12 text-brand-sage/40 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-brand-moss dark:text-white">No Trees Found in this Radius</h3>
          <p className="text-xs text-brand-earth mt-1 max-w-md mx-auto mb-4">
            Try expanding your distance radius filter (e.g. 100 km or All India) to view available timber listings across nearby districts.
          </p>
          <button
            onClick={() => setRadiusKm(0)}
            className="bg-brand-moss text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-sage transition-all"
          >
            Show All India Trees
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrees.map((tree) => (
            <div
              key={tree.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={tree.images?.[0] || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80'}
                    alt={tree.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-brand-moss/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                    <Navigation className="w-3 h-3 text-emerald-300" />
                    <span>{tree.distanceKm} km away</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 text-brand-moss text-xs font-black px-2.5 py-1 rounded-full shadow">
                    ₹{(tree.expectedPrice || tree.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-brand-moss dark:text-white line-clamp-1">
                        {tree.name}
                      </h3>
                      <p className="text-xs text-brand-sage font-medium">{tree.species || tree.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-brand-earth">
                    <MapPin className="w-3.5 h-3.5 text-brand-sage shrink-0" />
                    <span className="truncate">{tree.district}, {tree.state} ({tree.pincode})</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-2 text-[11px] font-bold text-center border-y border-dashed border-brand-clay/50">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-earth block">Age</span>
                      <span>{tree.age} yrs</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-earth block">Height</span>
                      <span>{tree.height} ft</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-earth block">Diameter</span>
                      <span>{tree.diameter} in</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setView('tree-details', { treeId: tree.id })}
                  className={`w-full py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    darkMode
                      ? 'border-brand-darkborder hover:bg-brand-darkborder text-slate-200'
                      : 'border-brand-clay hover:bg-brand-sand text-brand-moss'
                  }`}
                >
                  View Details
                </button>
                <button
                  onClick={() => onOpenChat(tree.sellerId, tree.id, tree.name)}
                  className="w-full bg-brand-moss hover:bg-brand-sage text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
