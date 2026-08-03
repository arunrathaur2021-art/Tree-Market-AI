import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Leaf, ArrowRight, AlertCircle, Chrome } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthViewProps {
  onAuthSuccess: (token: string, user: UserType) => void;
  darkMode: boolean;
}

const INDIAN_STATES_UT = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export default function AuthView({ onAuthSuccess, darkMode }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [contactNumber, setContactNumber] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, role, contactNumber, state, district, pincode };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Simulate Google OAuth flow by making direct backend API call
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'google.user@gmail.com',
          name: 'Google Indian Trader',
          role: role || 'buyer',
          googleId: 'g_' + Math.random().toString(36).substr(2, 9)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Google Authentication failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in" id="auth-view-container">
      <div className={`p-8 rounded-3xl border space-y-6 ${
        darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xl shadow-brand-sand/50'
      }`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-moss/10 text-brand-moss rounded-2xl border border-brand-moss/10">
            <Leaf className="w-6 h-6 text-brand-sage" />
          </div>
          <h2 className="text-2xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">
            {isLogin ? 'Welcome back to TreeMarket' : 'Create Account'}
          </h2>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
            {isLogin 
              ? 'Sign in to buy and sell timber, sandalwood, nurseries and orchards across India' 
              : 'Join India\'s first secure tree trading and price discovery platform'}
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold rounded-xl flex items-center gap-1.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
                }`}>
                  <User className="w-4 h-4 text-brand-earth/70 mr-2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-brand-moss dark:text-white placeholder-brand-earth/50"
                  />
                </div>
              </div>

              {/* Account Role Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Trading Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      role === 'buyer'
                        ? 'bg-brand-moss text-white border-brand-moss shadow-md'
                        : darkMode 
                        ? 'bg-brand-darkgreen border-brand-darkborder text-slate-300' 
                        : 'bg-brand-sand border-brand-clay text-brand-moss'
                    }`}
                  >
                    <span className="font-serif">I am a Buyer</span>
                    <span className="text-[9px] opacity-75 font-normal">Timber Buyer / Nursery Shopper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      role === 'seller'
                        ? 'bg-brand-moss text-white border-brand-moss shadow-md'
                        : darkMode 
                        ? 'bg-brand-darkgreen border-brand-darkborder text-slate-300' 
                        : 'bg-brand-sand border-brand-clay text-brand-moss'
                    }`}
                  >
                    <span className="font-serif">I am a Seller</span>
                    <span className="text-[9px] opacity-75 font-normal">Farmer / Nursery Owner</span>
                  </button>
                </div>
              </div>

              {/* Contact number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Contact Number (WhatsApp)</label>
                <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
                }`}>
                  <Phone className="w-4 h-4 text-brand-earth/70 mr-2" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-brand-moss dark:text-white placeholder-brand-earth/50"
                  />
                </div>
              </div>

              {/* Geography location selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
                    }`}
                  >
                    {INDIAN_STATES_UT.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">District</label>
                  <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-brand-sage ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
                  }`}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mysuru"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-brand-moss dark:text-white placeholder-brand-earth/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Pincode</label>
                <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
                }`}>
                  <MapPin className="w-4 h-4 text-brand-earth/70 mr-2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 570001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-brand-moss dark:text-white placeholder-brand-earth/50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-brand-sage ${
              darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
            }`}>
              <Mail className="w-4 h-4 text-brand-earth/70 mr-2" />
              <input
                type="email"
                required
                placeholder="you@example.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-brand-moss dark:text-white placeholder-brand-earth/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-brand-sage ${
              darkMode ? 'bg-brand-darkgreen border-brand-darkborder' : 'bg-brand-sand border-brand-clay'
            }`}>
              <Lock className="w-4 h-4 text-brand-earth/70 mr-2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm text-brand-moss dark:text-white placeholder-brand-earth/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-moss hover:bg-brand-sage disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="font-serif">{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider line */}
        <div className="flex items-center justify-between gap-3 py-1">
          <div className={`h-[1px] w-full ${darkMode ? 'bg-brand-darkborder' : 'bg-brand-clay'}`} />
          <span className="text-[10px] text-brand-earth uppercase font-bold tracking-wider">OR</span>
          <div className={`h-[1px] w-full ${darkMode ? 'bg-brand-darkborder' : 'bg-brand-clay'}`} />
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className={`w-full flex items-center justify-center gap-2.5 py-2.5 border text-sm font-semibold rounded-xl cursor-pointer transition-all ${
            darkMode 
              ? 'bg-brand-darkgreen hover:bg-brand-darkborder border-brand-darkborder text-slate-200' 
              : 'bg-white hover:bg-brand-sand border-brand-clay text-brand-moss'
          }`}
          id="google-login-btn"
        >
          <Chrome className="w-4 h-4 text-rose-500" />
          <span>Sign in with Google</span>
        </button>

        {/* Form Toggle Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs font-bold text-brand-sage hover:text-brand-moss cursor-pointer focus:outline-none"
          >
            {isLogin 
              ? "Don't have an account? Sign Up instead" 
              : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
