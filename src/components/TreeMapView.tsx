import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';
import { parseGpsCoords, calculateDistanceKm, getEstimatedLocationCoords } from '../data/indiaLocations';
import { Tree } from '../types';

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

interface TreeMapViewProps {
  tree: Tree;
  buyerGps?: string;
  darkMode?: boolean;
}

export default function TreeMapView({ tree, buyerGps, darkMode = false }: TreeMapViewProps) {
  const treeCoords = parseGpsCoords(tree.gpsLocation) || getEstimatedLocationCoords(tree.state, tree.district);
  const buyerCoords = parseGpsCoords(buyerGps);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    if (buyerCoords && treeCoords) {
      const dist = calculateDistanceKm(buyerCoords.lat, buyerCoords.lng, treeCoords.lat, treeCoords.lng);
      setDistanceKm(dist);
    }
  }, [buyerGps, tree.gpsLocation]);

  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${treeCoords.lat},${treeCoords.lng}`;
  const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

  return (
    <div className={`rounded-2xl border p-5 overflow-hidden ${
      darkMode ? 'bg-brand-darkcard/40 border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-brand-moss dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-sage" />
            Tree Location & Navigation
          </h3>
          <p className="text-xs text-brand-earth">
            Verified geographical location for harvest inspection & timber transport logistics.
          </p>
        </div>

        <a
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-moss hover:bg-brand-sage text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Address Details Badge Bar */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl border mb-4 text-xs ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-200' : 'bg-brand-sand/50 border-brand-clay/60 text-brand-moss'
      }`}>
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-earth block">Village / Area</span>
          <span className="font-bold">{tree.village || 'Near Farm'}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-earth block">Taluka / Tehsil</span>
          <span className="font-bold">{tree.tehsil || tree.district}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-earth block">District & State</span>
          <span className="font-bold">{tree.district}, {tree.state}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-earth block">PIN & Distance</span>
          <span className="font-bold text-brand-sage flex items-center gap-1">
            {tree.pincode}
            {distanceKm !== null && (
              <span className="bg-brand-sage/15 text-brand-sage px-1.5 py-0.5 rounded text-[10px]">
                {distanceKm} km away
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Google Map Container */}
      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-brand-clay/60 shadow-inner">
        {hasValidKey ? (
          <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
            <Map
              center={treeCoords}
              zoom={13}
              mapId="TREE_LOCATION_DETAIL_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <AdvancedMarker position={treeCoords} title={tree.name}>
                <Pin background="#2D5A27" glyphColor="#FFFFFF" borderColor="#1E3E1A" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/10 via-brand-sand to-teal-900/20 dark:from-brand-darkcard dark:to-brand-darkborder flex flex-col items-center justify-center p-6 text-center">
            <Compass className="w-12 h-12 text-brand-sage mb-3 animate-spin-slow" />
            <h4 className="text-base font-serif font-bold text-brand-moss dark:text-white">
              {tree.name} ({tree.species})
            </h4>
            <p className="text-xs text-brand-earth mt-1 max-w-md">
              {tree.village ? `${tree.village}, ` : ''}{tree.tehsil ? `${tree.tehsil}, ` : ''}{tree.district}, {tree.state} - {tree.pincode}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-mono bg-white dark:bg-brand-darkcard border px-3 py-1 rounded-full font-bold text-brand-sage">
                GPS: {treeCoords.lat}, {treeCoords.lng}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
