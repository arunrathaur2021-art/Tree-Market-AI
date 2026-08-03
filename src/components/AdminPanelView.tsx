import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Trees, Trash2, Check, AlertCircle, ShoppingBag, Landmark, Info } from 'lucide-react';
import { Tree, User } from '../types';

interface Order {
  id: string;
  buyerName: string;
  sellerName: string;
  treeName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface AdminPanelViewProps {
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
}

export default function AdminPanelView({ darkMode, setView }: AdminPanelViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'orders'>('users');
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalSellers: 0,
    totalTrees: 0,
    uniqueListingsCount: 0,
    totalTradeVolume: 0
  });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [listingsList, setListingsList] = useState<Tree[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Users
      const usersRes = await fetch('/api/admin/users', { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      // Fetch All Listings
      const treesRes = await fetch('/api/trees');
      if (treesRes.ok) {
        const treesData = await treesRes.json();
        setListingsList(treesData);
      }

      // Fetch Orders for admin review
      const ordersRes = await fetch('/api/admin/orders', { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrdersList(ordersData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to purge user "${name}"? This will delete their account and all their active tree listings permanently.`)) return;
    try {
      setActionError('');
      setActionSuccess('');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setActionSuccess(`Account "${name}" and all related listings successfully purged.`);
        fetchAdminData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to delete user.');
      }
    } catch (err) {
      setActionError('Network connection failed.');
    }
  };

  const handlePruneListing = async (id: string, title: string) => {
    if (!window.confirm(`Remove fake/spam listing "${title}" immediately?`)) return;
    try {
      setActionError('');
      setActionSuccess('');
      const res = await fetch(`/api/trees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setActionSuccess(`Pruned spam tree listing: "${title}".`);
        fetchAdminData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to remove listing.');
      }
    } catch (err) {
      setActionError('Network connection failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-brand-moss border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-brand-earth font-semibold animate-pulse">Consolidating admin audit charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fade-in" id="admin-panel-view">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2 text-brand-moss dark:text-white">
          <ShieldAlert className="w-8 h-8 text-brand-sage" /> Admin Moderation Panel
        </h1>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
          Track national users, timber transit orders, APMC compliance receipts, and manage spam/fake listings.
        </p>
      </div>

      {/* Action Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-brand-sage/15 text-brand-moss dark:text-brand-sage border border-brand-sage/30 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5" /> {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {actionError}
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        
        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm hover:shadow-md'
        }`}>
          <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Total Buyers</p>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-5 h-5 text-brand-sage" />
            <span className="text-2xl font-serif font-black text-brand-moss dark:text-white">{stats.totalBuyers}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm hover:shadow-md'
        }`}>
          <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Total Sellers</p>
          <div className="flex items-center gap-2 mt-1">
            <ShoppingBag className="w-5 h-5 text-brand-clay" />
            <span className="text-2xl font-serif font-black text-brand-moss dark:text-white">{stats.totalSellers}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm hover:shadow-md'
        }`}>
          <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Unique Species</p>
          <div className="flex items-center gap-2 mt-1">
            <Trees className="w-5 h-5 text-brand-moss" />
            <span className="text-2xl font-serif font-black text-brand-moss dark:text-white">{stats.uniqueListingsCount}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm hover:shadow-md'
        }`}>
          <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Stock Trees Volume</p>
          <div className="flex items-center gap-2 mt-1">
            <Trees className="w-5 h-5 text-brand-sage" />
            <span className="text-2xl font-serif font-black text-brand-moss dark:text-white">{stats.totalTrees}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all sm:col-span-1 ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm hover:shadow-md'
        }`}>
          <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Gross Trade Volume (₹)</p>
          <div className="flex items-center gap-2 mt-1">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-bold text-emerald-600">₹{(stats.totalTradeVolume || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* Main Panel Navigation tabs */}
      <div className="space-y-4">
        
        <div className="flex border-b border-brand-clay dark:border-brand-darkborder">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 text-xs uppercase font-bold tracking-wider cursor-pointer focus:outline-none transition-colors border-b-2 ${
              activeTab === 'users' 
                ? 'text-brand-sage border-brand-sage' 
                : 'text-brand-earth hover:text-brand-moss dark:text-slate-400'
            }`}
          >
            Manage Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3 px-6 text-xs uppercase font-bold tracking-wider cursor-pointer focus:outline-none transition-colors border-b-2 ${
              activeTab === 'listings' 
                ? 'text-brand-sage border-brand-sage' 
                : 'text-brand-earth hover:text-brand-moss dark:text-slate-400'
            }`}
          >
            Moderate Listings ({listingsList.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 text-xs uppercase font-bold tracking-wider cursor-pointer focus:outline-none transition-colors border-b-2 ${
              activeTab === 'orders' 
                ? 'text-brand-sage border-brand-sage' 
                : 'text-brand-earth hover:text-brand-moss dark:text-slate-400'
            }`}
          >
            Trade Orders Log ({ordersList.length})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'users' && (
          <div className={`border rounded-2xl overflow-x-auto ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                  darkMode ? 'border-brand-darkborder text-slate-400 bg-brand-darkgreen/40' : 'border-brand-clay text-brand-moss bg-brand-sand/50'
                }`}>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">State</th>
                  <th className="p-4">District</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-clay dark:divide-brand-darkborder">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-brand-sand/20 dark:hover:bg-brand-darkgreen/10 transition-colors">
                    <td className="p-4 font-bold text-brand-moss dark:text-slate-200 truncate max-w-[150px]">{usr.name}</td>
                    <td className="p-4 text-brand-earth dark:text-slate-400 truncate max-w-[180px]">{usr.email}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        usr.role === 'admin' 
                          ? 'bg-rose-500/15 text-rose-600' 
                          : usr.role === 'seller' 
                          ? 'bg-brand-sage/20 text-brand-moss' 
                          : 'bg-brand-clay/20 text-brand-earth'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-brand-earth dark:text-slate-400 text-xs">{usr.state || 'N/A'}</td>
                    <td className="p-4 text-brand-earth dark:text-slate-400 text-xs">{usr.district || 'N/A'}</td>
                    <td className="p-4 text-brand-earth dark:text-slate-400 text-xs font-mono">{new Date(usr.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {usr.role === 'admin' ? (
                        <span className="text-[10px] text-brand-earth/75 uppercase font-semibold">Protected</span>
                      ) : (
                        <button
                          onClick={() => handlePurgeUser(usr.id, usr.name)}
                          className="text-xs text-rose-500 hover:text-rose-400 hover:underline flex items-center gap-1 ml-auto cursor-pointer focus:outline-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Purge Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className={`border rounded-2xl overflow-x-auto ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                  darkMode ? 'border-brand-darkborder text-slate-400 bg-brand-darkgreen/40' : 'border-brand-clay text-brand-moss bg-brand-sand/50'
                }`}>
                  <th className="p-4">Tree Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Expected Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-clay dark:divide-brand-darkborder">
                {listingsList.map((tree) => {
                  const treePrice = tree.expectedPrice || tree.price || 0;
                  return (
                    <tr key={tree.id} className="hover:bg-brand-sand/20 dark:hover:bg-brand-darkgreen/10 transition-colors">
                      <td className="p-4 font-bold text-brand-moss dark:text-slate-200 truncate max-w-[180px]">{tree.name}</td>
                      <td className="p-4 text-brand-earth dark:text-slate-400 italic truncate max-w-[150px]">{tree.category}</td>
                      <td className="p-4 text-brand-earth dark:text-slate-300 font-medium truncate max-w-[120px]">{tree.sellerName}</td>
                      <td className="p-4 text-brand-earth dark:text-slate-400 text-xs truncate max-w-[150px]">{tree.district}, {tree.state}</td>
                      <td className="p-4 font-black text-brand-moss dark:text-brand-sage">₹{treePrice.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setView('details', { id: tree.id })}
                            className="text-xs text-brand-sage hover:text-brand-moss hover:underline cursor-pointer focus:outline-none"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handlePruneListing(tree.id, tree.name)}
                            className="text-xs text-rose-500 hover:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Fake
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={`border rounded-2xl overflow-x-auto ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                  darkMode ? 'border-brand-darkborder text-slate-400 bg-brand-darkgreen/40' : 'border-brand-clay text-brand-moss bg-brand-sand/50'
                }`}>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Tree Product</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Trade Price</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-clay dark:divide-brand-darkborder">
                {ordersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-sand/20 dark:hover:bg-brand-darkgreen/10 transition-colors">
                    <td className="p-4 text-xs font-mono font-bold text-brand-moss dark:text-slate-300">{ord.id}</td>
                    <td className="p-4 text-brand-earth dark:text-slate-400 truncate max-w-[150px]">{ord.treeName}</td>
                    <td className="p-4 text-brand-earth dark:text-slate-400">{ord.buyerName}</td>
                    <td className="p-4 text-brand-earth dark:text-slate-300 font-medium">{ord.sellerName}</td>
                    <td className="p-4 font-black text-emerald-600">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-xs">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        ord.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : ord.status === 'accepted' 
                          ? 'bg-brand-sage/20 text-brand-moss'
                          : ord.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-brand-sand text-brand-earth'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
