import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin, Compass, Search, Navigation, CheckCircle2, Building2, TreeDeciduous,
  Globe, Sparkles, X, ChevronRight, AlertCircle, RefreshCw, ShieldCheck,
  Edit3, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Save, LocateFixed
} from 'lucide-react';
import { useRegion } from '../context/RegionContext';
import {
  INDIA_LOCATIONS,
  DISTRICT_COORDS,
  getEstimatedLocationCoords,
  searchAddressPlacesSuggestions,
  geocodeAddressDetails,
  AddressSuggestion
} from '../data/indiaLocations';
import { Region } from '../types';
import LocationPickerMap from './LocationPickerMap';

interface RegionSelectorModalProps {
  darkMode?: boolean;
}

const PRESET_REGIONS = [
  { label: 'Yamunanagar, Haryana', state: 'Haryana', district: 'Yamunanagar', tehsil: 'Jagadhri', village: 'Mandebari', pincode: '135001' },
  { label: 'Saharanpur, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Saharanpur', tehsil: 'Saharanpur', village: 'Paper Mill Road', pincode: '247001' },
  { label: 'Lucknow, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Lucknow', tehsil: 'Lucknow', village: 'Chinhat', pincode: '226028' },
  { label: 'Ludhiana, Punjab', state: 'Punjab', district: 'Ludhiana', tehsil: 'Ludhiana East', village: 'Jamalpur', pincode: '141010' },
  { label: 'Shivamogga, Karnataka', state: 'Karnataka', district: 'Shivamogga', tehsil: 'Shivamogga', village: 'Sagar Road', pincode: '577201' },
  { label: 'Nagpur, Maharashtra', state: 'Maharashtra', district: 'Nagpur', tehsil: 'Nagpur', village: 'Kalamna Yard', pincode: '440008' }
];

export default function RegionSelectorModal({ darkMode = false }: RegionSelectorModalProps) {
  const {
    selectedRegion,
    setSelectedRegion,
    detectLocation,
    isRegionModalOpen,
    closeRegionModal,
    isDetecting,
    detectionError
  } = useRegion();

  const [activeTab, setActiveTab] = useState<'address' | 'auto' | 'manual'>('address');
  const [quickSearch, setQuickSearch] = useState('');

  // Custom Address Form State
  const [houseNo, setHouseNo] = useState(selectedRegion.houseNo || '');
  const [street, setStreet] = useState(selectedRegion.street || '');
  const [landmark, setLandmark] = useState(selectedRegion.landmark || '');
  const [village, setVillage] = useState(selectedRegion.village || selectedRegion.city || 'Mandebari');
  const [taluka, setTaluka] = useState(selectedRegion.taluka || 'Jagadhri');
  const [district, setDistrict] = useState(selectedRegion.district || 'Yamunanagar');
  const [state, setState] = useState(selectedRegion.state || 'Haryana');
  const [pincode, setPincode] = useState(selectedRegion.pincode || '135001');
  const [country] = useState('India');

  // Lat / Lng State
  const [lat, setLat] = useState<number>(selectedRegion.lat || 30.1290);
  const [lng, setLng] = useState<number>(selectedRegion.lng || 77.2952);

  // Google Places Autocomplete Suggestions
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync initial state when modal opens
  useEffect(() => {
    if (selectedRegion) {
      setHouseNo(selectedRegion.houseNo || '');
      setStreet(selectedRegion.street || '');
      setLandmark(selectedRegion.landmark || '');
      setVillage(selectedRegion.village || selectedRegion.city || 'Mandebari');
      setTaluka(selectedRegion.taluka || 'Jagadhri');
      setDistrict(selectedRegion.district || 'Yamunanagar');
      setState(selectedRegion.state || 'Haryana');
      setPincode(selectedRegion.pincode || '135001');
      setLat(selectedRegion.lat || 30.1290);
      setLng(selectedRegion.lng || 77.2952);
    }
  }, [selectedRegion, isRegionModalOpen]);

  // Handle live address typing search
  const handleAddressSearchChange = (val: string) => {
    setAddressQuery(val);
    if (val.trim().length >= 2) {
      const matches = searchAddressPlacesSuggestions(val);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a suggestion from Google Places search
  const handleSelectSuggestion = (sug: AddressSuggestion) => {
    if (sug.houseNo) setHouseNo(sug.houseNo);
    setStreet(sug.street);
    if (sug.landmark) setLandmark(sug.landmark);
    setVillage(sug.village);
    setTaluka(sug.taluka);
    setDistrict(sug.district);
    setState(sug.state);
    setPincode(sug.pincode);
    setLat(sug.lat);
    setLng(sug.lng);

    setAddressQuery(sug.formattedAddress);
    setShowSuggestions(false);
  };

  // Automatically compute/re-geocode lat & lng whenever address fields change (if user hasn't explicitly placed pin)
  const autoGeocodeAddress = () => {
    const geo = geocodeAddressDetails({ houseNo, street, village, taluka, district, state, pincode });
    setLat(geo.lat);
    setLng(geo.lng);
  };

  // Nudge map pin controls
  const nudgePin = (dLat: number, dLng: number) => {
    const newLat = Math.round((lat + dLat) * 100000) / 100000;
    const newLng = Math.round((lng + dLng) * 100000) / 100000;
    setLat(newLat);
    setLng(newLng);
  };

  // Hierarchy Data for Manual Cascading
  const statesList = useMemo(() => Array.from(new Set(INDIA_LOCATIONS.map(s => s.state))), []);

  const districtsList = useMemo(() => {
    if (!state) return [];
    const stObjs = INDIA_LOCATIONS.filter(s => s.state.toLowerCase() === state.toLowerCase());
    const districts = stObjs.flatMap(st => st.districts.map(d => d.district));
    return Array.from(new Set(districts));
  }, [state]);

  const tehsilsList = useMemo(() => {
    if (!state || !district) return [];
    const stObj = INDIA_LOCATIONS.find(s => s.state.toLowerCase() === state.toLowerCase());
    if (!stObj) return [];
    const dObj = stObj.districts.find(d => d.district.toLowerCase() === district.toLowerCase());
    return dObj ? dObj.tehsils.map(t => t.tehsil) : [];
  }, [state, district]);

  const villagesList = useMemo(() => {
    if (!state || !district || !taluka) return [];
    const stObj = INDIA_LOCATIONS.find(s => s.state.toLowerCase() === state.toLowerCase());
    if (!stObj) return [];
    const dObj = stObj.districts.find(d => d.district.toLowerCase() === district.toLowerCase());
    if (!dObj) return [];
    const tObj = dObj.tehsils.find(t => t.tehsil.toLowerCase() === taluka.toLowerCase());
    return tObj ? tObj.villages : [];
  }, [state, district, taluka]);

  if (!isRegionModalOpen) return null;

  const handleGPSDetect = async () => {
    const detected = await detectLocation();
    setState(detected.state);
    setDistrict(detected.district);
    setTaluka(detected.taluka);
    setVillage(detected.village);
    setPincode(detected.pincode);
    setLat(detected.lat);
    setLng(detected.lng);
  };

  // Save complete address to RegionContext, LocalStorage & Server Profile
  const handleSaveAddress = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    // Form constructed full address string
    const fullAddrParts = [
      houseNo,
      street,
      landmark,
      village,
      taluka,
      district,
      state,
      pincode ? `PIN - ${pincode}` : '',
      'India'
    ].filter(Boolean);
    const formattedFullAddress = fullAddrParts.join(', ');

    const finalLat = lat || getEstimatedLocationCoords(state, district).lat;
    const finalLng = lng || getEstimatedLocationCoords(state, district).lng;

    const newRegion: Region = {
      country: 'India',
      state: state || 'Haryana',
      district: district || 'Yamunanagar',
      taluka: taluka || 'Jagadhri',
      block: `${district || 'Yamunanagar'} Block`,
      village: village || 'Mandebari',
      pincode: pincode || '135001',
      lat: finalLat,
      lng: finalLng,
      fullAddress: formattedFullAddress,
      houseNo,
      street,
      landmark,
      city: village,
      isCustomAddress: true
    };

    setSelectedRegion(newRegion);

    // Save to user profile on server if token is present
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullAddress: formattedFullAddress,
            houseNo,
            street,
            landmark,
            village,
            taluka,
            district: newRegion.district,
            state: newRegion.state,
            pincode: newRegion.pincode,
            country: 'India',
            lat: finalLat,
            lng: finalLng
          })
        });
      } catch (err) {
        console.warn('Could not sync address to server:', err);
      }
    }

    setIsSaving(false);
    setSavedSuccess(true);

    setTimeout(() => {
      closeRegionModal();
      setSavedSuccess(false);
    }, 600);
  };

  const handleSelectPreset = (preset: typeof PRESET_REGIONS[0]) => {
    setState(preset.state);
    setDistrict(preset.district);
    setTaluka(preset.tehsil);
    setVillage(preset.village);
    setPincode(preset.pincode);

    const coords = getEstimatedLocationCoords(preset.state, preset.district);
    setLat(coords.lat);
    setLng(coords.lng);

    const newReg: Region = {
      country: 'India',
      state: preset.state,
      district: preset.district,
      taluka: preset.tehsil,
      block: `${preset.district} Block`,
      village: preset.village,
      pincode: preset.pincode,
      lat: coords.lat,
      lng: coords.lng,
      fullAddress: `${preset.village}, ${preset.tehsil}, ${preset.district}, ${preset.state} - ${preset.pincode}`
    };

    setSelectedRegion(newReg);
    closeRegionModal();
  };

  const handleQuickSearchSelect = (dName: string, stName: string) => {
    setState(stName);
    setDistrict(dName);
    setQuickSearch('');
    const stObj = INDIA_LOCATIONS.find(s => s.state === stName);
    const dObj = stObj?.districts.find(d => d.district === dName);
    if (dObj && dObj.tehsils[0]) {
      setTaluka(dObj.tehsils[0].tehsil);
      if (dObj.tehsils[0].villages[0]) setVillage(dObj.tehsils[0].villages[0]);
    }
    const coords = getEstimatedLocationCoords(stName, dName);
    setLat(coords.lat);
    setLng(coords.lng);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full min-w-0 max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-6 ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Top Decorative Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeRegionModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <TreeDeciduous className="w-3.5 h-3.5" /> TreeMarket AI India
              </span>
              <span className="text-xs text-emerald-200 font-semibold hidden sm:inline">
                Pan-India Regional Entry & Custom Geocoding
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
              🌳 Choose Your Region & <span className="text-emerald-400">Address</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              Select your region or enter your exact address to get local tree prices, nearby buyers, sellers, businesses, mandi prices, transport services, and government schemes.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">

          {/* Tab Switcher: 3 Navigation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'address'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span className="truncate">Enter Your Own Address</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('auto')}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'auto'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span className="truncate">Detect GPS Location</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="truncate">Select From List</span>
            </button>
          </div>

          {/* TAB 1: ENTER YOUR OWN ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-5 animate-fadeIn">

              {/* Google Places Live Suggestions Autocomplete Input */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>Google Places / Address Autocomplete Search</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Type or fill fields freely below
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={addressQuery}
                    onChange={(e) => handleAddressSearchChange(e.target.value)}
                    onFocus={() => addressQuery.trim().length >= 2 && setShowSuggestions(true)}
                    placeholder="Search address, landmark, area, city, or PIN code (e.g. Civil Lines, Saharanpur 247001)..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                </div>

                {/* Autocomplete Dropdown List */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className={`absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border max-h-56 overflow-y-auto shadow-2xl p-2 space-y-1 ${
                    darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-300'
                  }`}>
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                      Google Places Suggestions (Click to autofill):
                    </div>
                    {suggestions.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-emerald-500/20 hover:text-emerald-300 flex items-start gap-2 cursor-pointer transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">{sug.formattedAddress}</div>
                          <div className="text-[10px] text-slate-400">
                            Lat: {sug.lat}, Lng: {sug.lng} • PIN: {sug.pincode}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Comprehensive Address Form Fields */}
              <div className="p-4 rounded-2xl border space-y-3 bg-slate-900/30 border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Complete Address Details
                  </h3>
                  <button
                    type="button"
                    onClick={autoGeocodeAddress}
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <LocateFixed className="w-3 h-3" /> Re-detect Coordinates
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Address / House Number */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Full Address / House Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. House No. 42 / Plot 15-B / Farm No. 3"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Street / Area / Locality */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Street / Area / Locality <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. GT Road, Civil Lines, Paper Mill Area"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Landmark (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Landmark <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Bus Stand / Opposite SBI Bank / Near Timber Market"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Village / Town / City */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Village / Town / City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Mandebari / Jagadhri / Chinhat"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Tehsil / Taluka */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Tehsil / Taluka <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      placeholder="e.g. Jagadhri / Saharanpur Tehsil"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Yamunanagar / Saharanpur / Lucknow"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Haryana / Uttar Pradesh / Punjab"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 135001"
                      maxLength={6}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value="🇮🇳 India"
                      disabled
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Google Map View & Moveable Map Pin */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Interactive Google Map & Moveable Pin</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    GPS: {lat}, {lng}
                  </span>
                </div>

                {/* Map Picker Component */}
                <LocationPickerMap
                  gpsLocation={`${lat}, ${lng}`}
                  state={state}
                  district={district}
                  onLocationSelect={(gpsStr, nLat, nLng) => {
                    setLat(nLat);
                    setLng(nLng);
                  }}
                  darkMode={darkMode}
                />

                {/* Directional Nudge Buttons to adjust Pin position accurately */}
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-bold">
                    Adjust Map Pin Accuracy:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => nudgePin(0.0005, 0)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Nudge North 50m"
                    >
                      <ArrowUp className="w-3.5 h-3.5" /> N
                    </button>
                    <button
                      type="button"
                      onClick={() => nudgePin(-0.0005, 0)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Nudge South 50m"
                    >
                      <ArrowDown className="w-3.5 h-3.5" /> S
                    </button>
                    <button
                      type="button"
                      onClick={() => nudgePin(0, -0.0005)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Nudge West 50m"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> W
                    </button>
                    <button
                      type="button"
                      onClick={() => nudgePin(0, 0.0005)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Nudge East 50m"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> E
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit / Save Address Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={isSaving}
                  className={`w-full py-3.5 font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Saving Address to Firestore Profile...
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Address Saved Successfully!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Save Address & Load Local Platform
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: GPS AUTO DETECT */}
          {activeTab === 'auto' && (
            <div className="space-y-4 animate-fadeIn">
              <div className={`p-6 rounded-2xl border text-center space-y-4 ${
                darkMode ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                  <Navigation className={`w-8 h-8 ${isDetecting ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-400">GPS Regional Auto-Detection</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    TreeMarket AI will use your browser GPS location to identify your exact State, District, Tehsil, and PIN Code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGPSDetect}
                  disabled={isDetecting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-transform hover:scale-105"
                >
                  {isDetecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Detecting Location via GPS...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" /> Detect My Location Now
                    </>
                  )}
                </button>

                {detectionError && (
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{detectionError}</span>
                  </div>
                )}
              </div>

              {/* Current Active Region Preview */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Detected Regional Hierarchy</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded-xl bg-black/20 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">State</span>
                    <span className="font-bold text-emerald-300">{state}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">District</span>
                    <span className="font-bold text-emerald-300">{district}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">Taluka / Tehsil</span>
                    <span className="font-bold text-emerald-300">{taluka}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">PIN Code</span>
                    <span className="font-bold text-emerald-300">{pincode}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Confirm Location & Load Local Platform
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL CASCADE SELECTION FROM LIST */}
          {activeTab === 'manual' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Jump Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Quick search city, district, state or PIN (e.g. Saharanpur, Lucknow, Yamunanagar)..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />

                {/* Search Matches Dropdown */}
                {quickSearch.trim().length > 1 && (
                  <div className={`absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border max-h-48 overflow-y-auto shadow-2xl p-2 space-y-1 ${
                    darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-slate-300'
                  }`}>
                    {INDIA_LOCATIONS.flatMap(s => s.districts.map(d => ({ state: s.state, district: d.district })))
                      .filter(item => item.district.toLowerCase().includes(quickSearch.toLowerCase()) || item.state.toLowerCase().includes(quickSearch.toLowerCase()))
                      .slice(0, 6)
                      .map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickSearchSelect(item.district, item.state)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 hover:text-emerald-300 flex items-center justify-between cursor-pointer"
                        >
                          <span>📍 {item.district}, {item.state}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Administrative Hierarchy Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Country */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    disabled
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    <option value="India">🇮🇳 India (Bharat)</option>
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      setState(newSt);
                      setDistrict('');
                      setTaluka('');
                      setVillage('');
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">Select State</option>
                    {statesList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    disabled={!state}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setDistrict(newDist);
                      setTaluka('');
                      setVillage('');
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">{state ? 'Select District' : 'Choose State first'}</option>
                    {districtsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Taluka / Tehsil */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Taluka / Tehsil
                  </label>
                  <select
                    value={taluka}
                    disabled={!district}
                    onChange={(e) => {
                      setTaluka(e.target.value);
                      setVillage('');
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">{district ? 'Select Taluka / Tehsil' : 'Choose District first'}</option>
                    {tehsilsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Village / City */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Village / City
                  </label>
                  {villagesList.length > 0 ? (
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="">Select Village / City</option>
                      {villagesList.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Mandebari or Jagadhri"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 135001"
                    maxLength={6}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Save Selected Region & Load Platform
                </button>
              </div>
            </div>
          )}

          {/* Preset Timber Regions Chips */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Popular Timber & Agroforestry Regions:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_REGIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 ${
                    district === preset.district
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Developer Credit Footer */}
          <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-slate-800">
            © 2026 TreeMarket AI India. All Rights Reserved. Designed & Developed by <span className="font-bold text-slate-300">Arun Rathaur</span>
          </div>

        </div>
      </div>
    </div>
  );
}
