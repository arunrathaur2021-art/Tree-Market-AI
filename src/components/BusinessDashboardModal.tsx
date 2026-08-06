import React, { useState } from 'react';
import {
  X, Building2, Package, Sparkles, TrendingUp, MessageSquare, BarChart3,
  ShieldCheck, CheckCircle, Edit, Plus, Star, Award, Zap, Bell, Users
} from 'lucide-react';
import { Business, User } from '../types';

interface BusinessDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  darkMode: boolean;
  businesses: Business[];
  onRefresh: () => void;
}

export default function BusinessDashboardModal({
  isOpen,
  onClose,
  user,
  darkMode,
  businesses,
  onRefresh
}: BusinessDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'my-businesses' | 'products' | 'analytics' | 'premium'>('my-businesses');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [selectedBizId, setSelectedBizId] = useState<string>('');

  const myBusinesses = businesses.filter(b => b.userId === user?.id || b.ownerName.toLowerCase().includes((user?.name || '').toLowerCase()));

  if (!isOpen) return null;

  const currentBiz = myBusinesses.find(b => b.id === selectedBizId) || myBusinesses[0] || businesses[0];

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBiz || !newProductName || !newProductPrice) return;

    const updatedProducts = [
      ...(currentBiz.products || []),
      {
        id: `prod-${Date.now()}`,
        name: newProductName,
        price: newProductPrice,
        description: newProductDesc
      }
    ];

    try {
      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedProducts })
      });

      if (res.ok) {
        setNewProductName('');
        setNewProductPrice('');
        setNewProductDesc('');
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  const handleTogglePremium = async () => {
    if (!currentBiz) return;
    try {
      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: true })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden my-6 ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-emerald-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg font-serif">Business Directory Dashboard</h2>
              <p className="text-xs text-emerald-200">Manage products, trade enquiries, analytics & premium membership</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs sm:text-sm font-semibold overflow-x-auto ${
          darkMode ? 'border-brand-darkborder bg-brand-darkcard' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={() => setActiveTab('my-businesses')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'my-businesses' ? 'border-emerald-500 text-emerald-500 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            My Profiles ({myBusinesses.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'products' ? 'border-emerald-500 text-emerald-500 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Products & Pricing
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics' ? 'border-emerald-500 text-emerald-500 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Lead Analytics & Insights
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1 text-amber-500 ${
              activeTab === 'premium' ? 'border-amber-500 text-amber-500 font-bold' : 'border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Premium Membership
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {activeTab === 'my-businesses' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-emerald-500">Registered Business Entities</h3>
              {myBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {myBusinesses.map((biz) => (
                    <div key={biz.id} className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
                      darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={biz.logoUrl}
                          alt={biz.businessName}
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-500"
                        />
                        <div>
                          <h4 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                            {biz.businessName}
                            {biz.verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                          </h4>
                          <p className="text-xs text-slate-400">{biz.category} • {biz.district}, {biz.state}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {biz.rating}
                        </span>
                        <button
                          onClick={() => setSelectedBizId(biz.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Manage Catalog
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No registered business under your current account yet. Use the "+ Register Business" button to create your listing.
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && currentBiz && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase text-emerald-500">Manage Catalog for {currentBiz.businessName}</h3>

              {/* Add Product Form */}
              <form onSubmit={handleAddProduct} className={`p-4 rounded-xl border space-y-3 ${
                darkMode ? 'bg-brand-darkgreen/20 border-brand-darkborder' : 'bg-slate-100 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold uppercase text-slate-300">Add New Product / Wood Grade</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Product Name (e.g. Seasoned Teak Plank Grade A)"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className={`px-3 py-2 text-xs rounded-xl border ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pricing (e.g. ₹1,850 / Cft)"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className={`px-3 py-2 text-xs rounded-xl border ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Short Description / Specs (girth, moisture level, seasoning method)"
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                    + Add Product Item
                  </button>
                </div>
              </form>

              {/* Current Product List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(currentBiz.products || []).map((p) => (
                  <div key={p.id} className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between font-bold text-xs text-emerald-400">
                      <span>{p.name}</span>
                      <span className="text-amber-400">{p.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && currentBiz && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-emerald-500">Business Profile Reach & Leads</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-2xl font-bold text-emerald-400 block">1,240</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Directory Views</span>
                </div>
                <div className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-2xl font-bold text-blue-400 block">86</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Phone & WhatsApp Leads</span>
                </div>
                <div className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-2xl font-bold text-amber-400 block">34</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quote Inquiries</span>
                </div>
                <div className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-2xl font-bold text-purple-400 block">98%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Profile Health</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'premium' && currentBiz && (
            <div className="space-y-6 text-center max-w-xl mx-auto py-4">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-amber-400 font-serif">Upgrade to TreeMarket AI Premium Partner</h3>
              <p className="text-xs text-slate-300">
                Get top search positioning in your state & district, verified business badge, direct AI leads, and unlimited buyer chats.
              </p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-semibold"><CheckCircle className="w-4 h-4 text-amber-400" /> Featured Listing badge on top of search results</div>
                <div className="flex items-center gap-2 text-slate-200 font-semibold"><CheckCircle className="w-4 h-4 text-amber-400" /> Verified Gold Business Shield</div>
                <div className="flex items-center gap-2 text-slate-200 font-semibold"><CheckCircle className="w-4 h-4 text-amber-400" /> Automated WhatsApp alerts for nearby farmer harvests</div>
              </div>

              <button
                onClick={handleTogglePremium}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform cursor-pointer"
              >
                {currentBiz.isPremium ? '✓ Premium Plan Active' : 'Activate Premium Membership (Free Trial)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
