import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, Mail, FileText, Camera, Upload, CheckCircle, Sparkles, Clock, Globe } from 'lucide-react';
import { User, Business } from '../types';

interface RegisterBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  darkMode: boolean;
  onBusinessCreated: (business: Business) => void;
}

const CATEGORIES = [
  'Timber Industries', 'Sawmills', 'Furniture Manufacturers', 'Plywood Industries',
  'Paper Mills', 'Wood Traders', 'Tree Buyers', 'Exporters', 'Importers',
  'Nurseries', 'Seed Suppliers', 'Plant Suppliers', 'Farm Equipment Dealers',
  'Transport & Logistics', 'Cold Storage', 'Warehouse', 'Packaging',
  'Government Departments', 'Forest Contractors', 'Carpenters', 'Wood Processing Units',
  'Biomass Plants', 'Biofuel Companies', 'Wood Pellet Industries', 'Consultants',
  'Banks & Finance', 'Insurance', 'Agricultural Services', 'Labor Contractors',
  'Machine Rental', 'Other Businesses'
];

const STATES = [
  'Haryana', 'Punjab', 'Uttar Pradesh', 'Karnataka', 'Maharashtra', 'Gujarat',
  'Tamil Nadu', 'Andhra Pradesh', 'Kerala', 'Madhya Pradesh', 'Rajasthan',
  'West Bengal', 'Bihar', 'Odisha', 'Telangana', 'Uttarakhand', 'Himachal Pradesh'
];

export default function RegisterBusinessModal({
  isOpen,
  onClose,
  user,
  darkMode,
  onBusinessCreated
}: RegisterBusinessModalProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: user?.name || '',
    mobile: user?.contactNumber || '',
    email: user?.email || '',
    gstNumber: '',
    category: 'Sawmills',
    description: '',
    address: '',
    village: '',
    taluka: '',
    district: user?.district || '',
    state: user?.state || 'Haryana',
    pincode: user?.pincode || '',
    gpsLocation: '',
    website: '',
    whatsApp: user?.contactNumber || '',
    businessHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    yearsOfExperience: 5,
    capacity: '',
    availableTreeSpecies: 'Teak (Sagwan), Poplar, Eucalyptus',
    currentRequirements: '',
    services: 'Timber Slicing, Log Transport, Seasoning',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            gpsLocation: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          });
        },
        () => {
          setFormData({ ...formData, gpsLocation: '30.1290, 77.2674 (Simulated GPS)' });
        }
      );
    } else {
      setFormData({ ...formData, gpsLocation: '30.1290, 77.2674' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        availableTreeSpecies: formData.availableTreeSpecies.split(',').map(s => s.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean)
      };

      const token = localStorage.getItem('token');
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to register business');
      }

      const created = await res.json();
      setSuccessMsg('Business Profile registered & verified successfully!');
      setTimeout(() => {
        onBusinessCreated(created);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-2xl shadow-2xl my-8 border overflow-hidden ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-emerald-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">Register Your Business</h2>
              <p className="text-xs text-emerald-100">Connect with farmers, sawmills & buyers across TreeMarket AI India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-2 font-medium text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Business Overview */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 border-b pb-2 border-emerald-500/20">
              <Building2 className="w-4 h-4" /> 1. Business & Ownership Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. Haryana Timber Sawmill & Peeling"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Owner Name *</label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Kumar"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Business Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 06AABCU9603R1ZM"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Business Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your wood processing machinery, capacity, buying species, payment terms..."
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Section 2: Contact & Location Hierarchy */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 border-b pb-2 border-emerald-500/20">
              <MapPin className="w-4 h-4" /> 2. Location & Contact Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsApp"
                  value={formData.whatsApp}
                  onChange={handleInputChange}
                  placeholder="WhatsApp contact"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="business@example.com"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourbusiness.com"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Address Hierarchy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="e.g. Yamunanagar / Mysuru"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Taluka / Tehsil</label>
                <input
                  type="text"
                  name="taluka"
                  value={formData.taluka}
                  onChange={handleInputChange}
                  placeholder="e.g. Jagadhri"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Village / Locality</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  placeholder="e.g. Manakpur"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit PIN"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Google Maps Coordinates</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="gpsLocation"
                    value={formData.gpsLocation}
                    onChange={handleInputChange}
                    placeholder="Lat, Long"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shrink-0 cursor-pointer"
                  >
                    GPS
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Full Factory / Shop Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Plot No., Road Name, Landmark, Industrial Area"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Section 3: Operations & Capabilities */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 border-b pb-2 border-emerald-500/20">
              <Sparkles className="w-4 h-4" /> 3. Commercial Capacity & Timber Requirements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Processing Capacity</label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="e.g. 500 Tons / Month"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Handled / Purchased Tree Species (comma separated)</label>
              <input
                type="text"
                name="availableTreeSpecies"
                value={formData.availableTreeSpecies}
                onChange={handleInputChange}
                placeholder="Teak, Poplar, Eucalyptus, Sheesham, Melia Dubia"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Current Procurement Requirements (Farmer Notice)</label>
              <textarea
                name="currentRequirements"
                rows={2}
                value={formData.currentRequirements}
                onChange={handleInputChange}
                placeholder="e.g. Urgent buying 300 tons Poplar round logs girth 24 inches+ at best APMC rates."
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-emerald-500/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl border ${
                darkMode ? 'border-brand-darkborder text-slate-300 hover:bg-brand-darkborder' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-colors"
            >
              {loading ? (
                <>Registering Business...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  + Register & List Business
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
