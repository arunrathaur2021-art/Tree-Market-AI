import React, { useState } from 'react';
import { X, Send, CheckCircle, FileText, TreeDeciduous, Phone, Mail, User as UserIcon } from 'lucide-react';
import { Business, User } from '../types';

interface RequestQuoteModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  darkMode: boolean;
}

export default function RequestQuoteModal({
  business,
  isOpen,
  onClose,
  user,
  darkMode
}: RequestQuoteModalProps) {
  const [formData, setFormData] = useState({
    senderName: user?.name || '',
    senderPhone: user?.contactNumber || '',
    senderEmail: user?.email || '',
    treeSpecies: 'Teak (Sagwan)',
    quantity: '50 Tons / 20 Trees',
    requirementDetails: '',
    preferredDeliveryDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder text-slate-100' : 'bg-white border-brand-clay text-brand-moss'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-emerald-700 text-white">
          <div>
            <h2 className="font-bold text-base font-serif">Request Quote / Price Estimate</h2>
            <p className="text-xs text-emerald-100">Send inquiry directly to <span className="font-semibold">{business.businessName}</span></p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-emerald-500">Quote Request Sent!</h3>
            <p className="text-xs text-slate-400">
              The business owner ({business.ownerName}) has been notified via WhatsApp and TreeMarket AI inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="Full name"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  placeholder="10-digit number"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Timber / Species</label>
                <input
                  type="text"
                  value={formData.treeSpecies}
                  onChange={(e) => setFormData({ ...formData, treeSpecies: e.target.value })}
                  placeholder="Teak, Poplar, Plywood..."
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Approx Quantity / Volume</label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 50 Tons / 500 Cft"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Requirement Details / Message</label>
              <textarea
                rows={3}
                value={formData.requirementDetails}
                onChange={(e) => setFormData({ ...formData, requirementDetails: e.target.value })}
                placeholder="Mention log girth, moisture condition, delivery location or questions..."
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-100' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-medium rounded-xl border ${
                  darkMode ? 'border-brand-darkborder text-slate-300 hover:bg-brand-darkborder' : 'border-slate-300 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Sending Request...' : 'Submit Quote Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
