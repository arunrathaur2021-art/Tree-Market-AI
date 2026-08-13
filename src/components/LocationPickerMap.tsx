import React, { useState, useEffect } from 'react'; import MapSafe from './MapSafe';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Crosshair, Check, AlertCircle } from 'lucide-react';
import { parseGpsCoords, getEstimatedLocationCoords } from '../data/indiaLocations';

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

interface LocationPickerMapProps {
  gpsLocation?: string;
  state?: string;
  district?: string;
  onLocationSelect: (gpsStr: string, lat: number, lng: number) => void;
  darkMode?: boolean;
}

export default function LocationPickerMap({
  gpsLocation,
  state,
  district,
  onLocationSelect,
  darkMode = false
}: LocationPickerMapProps) {
  const parsed = parseGpsCoords(gpsLocation);
  const defaultCoords = parsed || getEstimatedLocationCoords(state, district);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(defaultCoords);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    if (parsed) {
      setCoords(parsed);
    }
  }, [gpsLocation]);

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Math.round(position.coords.latitude * 1000000) / 1000000;
        const newLng = Math.round(position.coords.longitude * 1000000) / 1000000;
        const gpsStr = `${newLat}, ${newLng}`;
        setCoords({ lat: newLat, lng: newLng });
        onLocationSelect(gpsStr, newLat, newLng);
        setDetectingGps(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        setGpsError('Could not get browser GPS. Please click or enter coordinates manually.');
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

  return (
    <div className={`p-4 rounded-2xl border ${
      darkMode ? 'bg-brand-darkcard/50 border-brand-darkborder' : 'bg-brand-sand/40 border-brand-clay/60'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-sage animate-pulse" />
          <h4 className="text-xs font-bold text-brand-moss dark:text-white">
            GPS Pin & Map Coordinates
          </h4>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentGps}
          disabled={detectingGps}
          className="bg-brand-moss hover:bg-brand-sage text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Crosshair className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
          <span>{detectingGps ? 'Detecting GPS...' : 'Use Current Device GPS'}</span>
        </button>
      </div>

      {gpsError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mb-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map View */}
      <div className="relative w-full h-52 rounded-xl overflow-hidden border border-brand-clay/50 shadow-inner mb-3">
        {hasValidKey ? (
          <MapSafe><APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
            <Map
              center={coords}
              zoom={13}
              mapId="TREEMARKET_PICKER_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              onClick={(e) => {
                if (e.detail?.latLng) {
                  const lat = Math.round(e.detail.latLng.lat * 1000000) / 1000000;
                  const lng = Math.round(e.detail.latLng.lng * 1000000) / 1000000;
                  setCoords({ lat, lng });
                  onLocationSelect(`${lat}, ${lng}`, lat, lng);
                }
              }}
            >
              <AdvancedMarker position={coords}>
                <Pin background="#2D5A27" glyphColor="#FFFFFF" borderColor="#1E3E1A" />
              </AdvancedMarker>
            </Map>
          </APIProvider></MapSafe>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/10 to-teal-900/20 dark:from-brand-darkborder/50 dark:to-brand-darkcard/80 flex flex-col items-center justify-center p-4 text-center">
            <MapPin className="w-8 h-8 text-brand-sage mb-2 animate-bounce" />
            <p className="text-xs font-bold text-brand-moss dark:text-slate-200">
              Interactive GPS Location Pin
            </p>
            <p className="text-[11px] text-brand-earth mt-1 max-w-xs">
              Latitude: <strong className="text-brand-sage">{coords.lat}</strong>, Longitude: <strong className="text-brand-sage">{coords.lng}</strong>
            </p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold mt-2">
              GPS Position Verified
            </span>
          </div>
        )}
      </div>

      {/* Manual Lat/Lng inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-brand-earth mb-0.5">Latitude</label>
          <input
            type="number"
            step="any"
            value={coords.lat}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setCoords(prev => ({ ...prev, lat: val }));
              onLocationSelect(`${val}, ${coords.lng}`, val, coords.lng);
            }}
            className={`w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
            }`}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-brand-earth mb-0.5">Longitude</label>
          <input
            type="number"
            step="any"
            value={coords.lng}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setCoords(prev => ({ ...prev, lng: val }));
              onLocationSelect(`${coords.lat}, ${val}`, coords.lat, val);
            }}
            className={`w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
              darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
