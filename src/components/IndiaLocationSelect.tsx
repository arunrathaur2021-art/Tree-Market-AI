import React, { useMemo } from 'react';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { MapPin } from 'lucide-react';

interface IndiaLocationSelectProps {
  state: string;
  district: string;
  tehsil?: string;
  village?: string;
  pincode?: string;
  onChange: (updates: {
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    pincode?: string;
    gpsLocation?: string;
  }) => void;
  darkMode?: boolean;
  required?: boolean;
}

export default function IndiaLocationSelect({
  state,
  district,
  tehsil = '',
  village = '',
  pincode = '',
  onChange,
  darkMode = false,
  required = false
}: IndiaLocationSelectProps) {
  // Available States
  const statesList = useMemo(() => Array.from(new Set(INDIA_LOCATIONS.map(s => s.state))), []);

  // Available Districts for selected State
  const districtsList = useMemo(() => {
    if (!state) return [];
    const stObjs = INDIA_LOCATIONS.filter(s => s.state.toLowerCase() === state.toLowerCase());
    const districts = stObjs.flatMap(st => st.districts.map(d => d.district));
    return Array.from(new Set(districts));
  }, [state]);

  // Available Tehsils for selected District
  const tehsilsList = useMemo(() => {
    if (!state || !district) return [];
    const stObj = INDIA_LOCATIONS.find(s => s.state.toLowerCase() === state.toLowerCase());
    if (!stObj) return [];
    const dObj = stObj.districts.find(d => d.district.toLowerCase() === district.toLowerCase());
    return dObj ? dObj.tehsils.map(t => t.tehsil) : [];
  }, [state, district]);

  // Available Villages for selected Tehsil
  const villagesList = useMemo(() => {
    if (!state || !district || !tehsil) return [];
    const stObj = INDIA_LOCATIONS.find(s => s.state.toLowerCase() === state.toLowerCase());
    if (!stObj) return [];
    const dObj = stObj.districts.find(d => d.district.toLowerCase() === district.toLowerCase());
    if (!dObj) return [];
    const tObj = dObj.tehsils.find(t => t.tehsil.toLowerCase() === tehsil.toLowerCase());
    return tObj ? tObj.villages : [];
  }, [state, district, tehsil]);

  const selectClasses = `w-full text-xs font-semibold px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-sage transition-all ${
    darkMode
      ? 'bg-brand-darkcard border-brand-darkborder text-slate-100'
      : 'bg-white border-brand-clay text-brand-moss'
  }`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-brand-sage">
        <MapPin className="w-4 h-4" />
        <span>Indian Administrative Location Hierarchy</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* State */}
        <div>
          <label className="block text-[11px] font-bold text-brand-earth mb-1">
            State {required && <span className="text-rose-500">*</span>}
          </label>
          <select
            value={state}
            onChange={(e) => {
              const newState = e.target.value;
              const stObj = INDIA_LOCATIONS.find(s => s.state === newState);
              onChange({
                state: newState,
                district: '',
                tehsil: '',
                village: '',
                gpsLocation: stObj ? `${stObj.center.lat}, ${stObj.center.lng}` : undefined
              });
            }}
            className={selectClasses}
            required={required}
          >
            <option value="">Select State</option>
            {statesList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-[11px] font-bold text-brand-earth mb-1">
            District {required && <span className="text-rose-500">*</span>}
          </label>
          <select
            value={district}
            disabled={!state}
            onChange={(e) => {
              onChange({
                district: e.target.value,
                tehsil: '',
                village: ''
              });
            }}
            className={selectClasses}
            required={required}
          >
            <option value="">{state ? 'Select District' : 'Choose State first'}</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Tehsil/Taluka */}
        <div>
          <label className="block text-[11px] font-bold text-brand-earth mb-1">
            Taluka / Tehsil
          </label>
          <select
            value={tehsil}
            disabled={!district}
            onChange={(e) => {
              onChange({
                tehsil: e.target.value,
                village: ''
              });
            }}
            className={selectClasses}
          >
            <option value="">{district ? 'Select Tehsil' : 'Choose District first'}</option>
            {tehsilsList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div>
          <label className="block text-[11px] font-bold text-brand-earth mb-1">
            Village / Area
          </label>
          {villagesList.length > 0 ? (
            <select
              value={village}
              onChange={(e) => onChange({ village: e.target.value })}
              className={selectClasses}
            >
              <option value="">Select Village</option>
              {villagesList.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={village}
              placeholder="Enter Village name"
              onChange={(e) => onChange({ village: e.target.value })}
              className={selectClasses}
            />
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-1/2">
          <label className="block text-[11px] font-bold text-brand-earth mb-1">PIN Code</label>
          <input
            type="text"
            maxLength={6}
            value={pincode}
            placeholder="6-digit PIN code"
            onChange={(e) => onChange({ pincode: e.target.value })}
            className={selectClasses}
          />
        </div>
      </div>
    </div>
  );
}
