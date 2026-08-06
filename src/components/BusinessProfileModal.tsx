import React, { useState } from 'react';
import {
  X, CheckCircle, ShieldCheck, Star, MapPin, Phone, MessageSquare, Mail, Globe,
  Share2, Bookmark, Flag, Calendar, Award, Package, Clock, ExternalLink,
  ChevronRight, ThumbsUp, Send, UserCheck, AlertCircle, Sparkles
} from 'lucide-react';
import { Business, User } from '../types';

interface BusinessProfileModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
  onRequestQuote: (business: Business) => void;
}

export default function BusinessProfileModal({
  business,
  isOpen,
  onClose,
  user,
  darkMode,
  setView,
  onRequestQuote
}: BusinessProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews' | 'location'>('overview');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localBusiness, setLocalBusiness] = useState<Business | null>(business);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setLocalBusiness(business);
  }, [business]);

  if (!isOpen || !localBusiness) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/businesses/${localBusiness.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          reviewerName: user?.name || 'Verified Agro Trader'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setLocalBusiness(updated);
        setReviewComment('');
      }
    } catch (err) {
      console.error("Failed to add review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden my-6 ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
      }`}>
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-60 bg-slate-800 overflow-hidden">
          <img
            src={localBusiness.coverUrl || 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=1000&auto=format&fit=crop&q=80'}
            alt={localBusiness.businessName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Verification Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            {localBusiness.verified && (
              <span className="px-3 py-1 bg-emerald-600/90 text-white text-xs font-semibold rounded-full flex items-center gap-1 backdrop-blur-sm shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Directory Partner
              </span>
            )}
            {localBusiness.isPremium && (
              <span className="px-3 py-1 bg-amber-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1 backdrop-blur-sm shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> Premium Member
              </span>
            )}
          </div>

          {/* Logo & Headline */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex items-end gap-3.5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-2xl overflow-hidden shrink-0 border-2 border-emerald-500">
                <img
                  src={localBusiness.logoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=300&auto=format&fit=crop&q=80'}
                  alt={localBusiness.businessName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-white">
                <h1 className="text-xl sm:text-2xl font-bold font-serif leading-tight">{localBusiness.businessName}</h1>
                <p className="text-xs text-emerald-300 font-medium flex items-center gap-2 mt-0.5">
                  <span>{localBusiness.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {localBusiness.district}, {localBusiness.state}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Rating */}
            <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-amber-400 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{localBusiness.rating}</span>
              <span className="text-xs text-slate-300 font-normal">({localBusiness.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          darkMode ? 'bg-brand-darkgreen/50 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setView('chat', { partnerId: localBusiness.userId, treeId: localBusiness.id });
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Real-time Chat
            </button>

            <a
              href={`tel:${localBusiness.mobile}`}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" /> Call Owner
            </a>

            {localBusiness.whatsApp && (
              <a
                href={`https://wa.me/91${localBusiness.whatsApp}?text=Hello%20${encodeURIComponent(localBusiness.businessName)},%20I%20found%20your%20business%20on%20TreeMarket%20AI%20India.`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}

            <button
              onClick={() => onRequestQuote(localBusiness)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              Request Quote
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 cursor-pointer ${
                darkMode ? 'border-brand-darkborder hover:bg-brand-darkborder text-slate-200' : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-4 h-4" />
              {copiedLink ? 'Copied!' : 'Share'}
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 cursor-pointer ${
                saved ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : darkMode ? 'border-brand-darkborder text-slate-200' : 'border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-rose-500' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b text-sm font-semibold ${
          darkMode ? 'border-brand-darkborder bg-brand-darkcard' : 'border-slate-200 bg-white'
        }`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Specs
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Products & Services ({localBusiness.products?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Reviews ({localBusiness.reviewCount})
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'location'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Map & Contact
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500 mb-2">About {localBusiness.businessName}</h3>
                <p className="text-sm leading-relaxed opacity-90">{localBusiness.description}</p>
              </div>

              {/* Requirement Highlight Box */}
              {localBusiness.currentRequirements && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                    <AlertCircle className="w-4 h-4" /> Current Farmer Procurement Requirement
                  </span>
                  <p className="text-sm text-slate-200">{localBusiness.currentRequirements}</p>
                </div>
              )}

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner / Contact</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-0.5">{localBusiness.ownerName}</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Years Experience</span>
                  <span className="text-sm font-bold block mt-0.5">{localBusiness.yearsOfExperience || 10}+ Years</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Processing Capacity</span>
                  <span className="text-sm font-bold block mt-0.5">{localBusiness.capacity || 'Large Scale'}</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">GST Reg. Number</span>
                  <span className="text-xs font-mono font-bold text-slate-300 block mt-1">{localBusiness.gstNumber || 'Verified Registered'}</span>
                </div>
              </div>

              {/* Handled Species */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available / Purchased Timber Species</h4>
                <div className="flex flex-wrap gap-2">
                  {(localBusiness.availableTreeSpecies || ['Teak', 'Poplar', 'Eucalyptus']).map((sp, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg">
                      🌲 {sp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Offered Services */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Offered Services</h4>
                <div className="flex flex-wrap gap-2">
                  {(localBusiness.services || ['Wood Cutting', 'Seasoning', 'Log Transport']).map((srv, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-lg">
                      ⚙️ {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">Products & Price Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(localBusiness.products && localBusiness.products.length > 0) ? (
                  localBusiness.products.map((prod) => (
                    <div key={prod.id} className={`p-4 rounded-xl border flex flex-col justify-between ${
                      darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-emerald-400">{prod.name}</h4>
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30">
                            {prod.price}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{prod.description}</p>
                      </div>
                      <button
                        onClick={() => onRequestQuote(localBusiness)}
                        className="mt-4 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Inquire Pricing
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic col-span-2">No product catalog items published yet. Contact owner directly for custom quotes.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Summary Header */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-amber-400">{localBusiness.rating}</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(localBusiness.rating) ? 'fill-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Based on {localBusiness.reviewCount} verified buyer & farmer reviews</p>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className={`p-4 rounded-xl border space-y-3 ${
                darkMode ? 'bg-brand-darkgreen/20 border-brand-darkborder' : 'bg-slate-100 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold uppercase text-emerald-500">Write a Review for {localBusiness.businessName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Your Rating:</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your feedback regarding wood quality, weighing accuracy, payment speed, or logistics..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>

              {/* Review list */}
              <div className="space-y-3">
                {(localBusiness.reviews || []).map((rev) => (
                  <div key={rev.id} className={`p-3.5 rounded-xl border ${
                    darkMode ? 'bg-brand-darkgreen/30 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-400">{rev.reviewerName}</span>
                        <div className="flex text-amber-400 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">Factory & Office Location</h3>
              
              <div className={`p-4 rounded-xl border space-y-2 ${
                darkMode ? 'bg-brand-darkgreen/40 border-brand-darkborder' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {localBusiness.address}, {localBusiness.village ? `${localBusiness.village}, ` : ''}{localBusiness.taluka ? `${localBusiness.taluka}, ` : ''}{localBusiness.district}, {localBusiness.state} - {localBusiness.pincode}
                </p>
                {localBusiness.gpsLocation && (
                  <p className="text-xs text-slate-400 font-mono">GPS Coordinates: {localBusiness.gpsLocation}</p>
                )}
              </div>

              {/* Google Maps Simulation Iframe */}
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-emerald-500/30 relative bg-slate-900 flex items-center justify-center">
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(localBusiness.address + ' ' + localBusiness.district + ' ' + localBusiness.state)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                />
              </div>

              <div className="flex justify-end gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localBusiness.businessName + ' ' + localBusiness.district)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" /> Open in Google Maps Navigation
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
