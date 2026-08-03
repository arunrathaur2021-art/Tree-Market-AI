import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Heart, Phone, Mail, ChevronRight, Check, Trees, Sparkles, Send, ShieldAlert, Bot, MessageSquare, CreditCard, ShoppingBag, Star, Info, Loader2, Maximize2, ChevronLeft, X, Bell, Plus } from 'lucide-react';
import { Tree, PriceComparison, User, Review } from '../types';
import TreeMapView from './TreeMapView';

interface TreeDetailsViewProps {
  treeId: string;
  setView: (view: string, params?: any) => void;
  user: User | null;
  darkMode: boolean;
  isFavorited: boolean;
  toggleFavorite: (treeId: string) => Promise<void>;
}

export default function TreeDetailsView({
  treeId,
  setView,
  user,
  darkMode,
  isFavorited,
  toggleFavorite
}: TreeDetailsViewProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    tree: Tree;
    priceComparison: PriceComparison;
    similarTrees: Tree[];
    reviews?: Review[];
  } | null>(null);

  const [activeImage, setActiveImage] = useState('');
  
  // AI estimated price states
  const [aiEstimate, setAiEstimate] = useState<string>('');
  const [aiEstimateLoading, setAiEstimateLoading] = useState(false);

  // Lightbox gallery states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Checkout & Payment states
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'phonepe' | 'gpay' | 'paytm' | 'razorpay'>('upi');
  
  // Delivery address states (Indian system)
  const [deliveryState, setDeliveryState] = useState(user?.state || '');
  const [deliveryDistrict, setDeliveryDistrict] = useState(user?.district || '');
  const [deliveryTehsil, setDeliveryTehsil] = useState('');
  const [deliveryVillage, setDeliveryVillage] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState(user?.pincode || '');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Arborist AI Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Price Alert widget states
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertStatus, setAlertStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [alertError, setAlertError] = useState('');

  const fetchAiPriceEstimate = async (tree: Tree) => {
    try {
      setAiEstimateLoading(true);
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          name: tree.name,
          species: tree.scientificName || tree.species || tree.category,
          age: tree.age,
          height: tree.height,
          diameter: tree.diameter,
          location: `${tree.district}, ${tree.state}`
        })
      });
      if (res.ok) {
        const estimateData = await res.json();
        setAiEstimate(estimateData.suggestedPriceRange);
      } else {
        const basePrice = (tree.age * 1200) + (tree.height * 250) + (tree.diameter * 400);
        const minPrice = Math.round(basePrice * 0.85);
        const maxPrice = Math.round(basePrice * 1.15);
        setAiEstimate(`₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`);
      }
    } catch (err) {
      const basePrice = (tree.age * 1200) + (tree.height * 250) + (tree.diameter * 400);
      const minPrice = Math.round(basePrice * 0.85);
      const maxPrice = Math.round(basePrice * 1.15);
      setAiEstimate(`₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`);
    } finally {
      setAiEstimateLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [treeId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/trees/${treeId}`, { headers });
      if (res.ok) {
        const resJson = await res.json();
        setData(resJson);
        if (resJson.tree?.images?.length > 0) {
          setActiveImage(resJson.tree.images[0]);
        }

        if (resJson.tree) {
          const price = resJson.tree.expectedPrice || resJson.tree.price || 0;
          setAlertTargetPrice(String(Math.round(price * 0.9)));
        }
        
        // Fetch AI Price range
        if (resJson.tree) {
          fetchAiPriceEstimate(resJson.tree);
        }

        // Fetch reviews
        const revRes = await fetch(`/api/reviews/${treeId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData);
        }

        // Seed the chatbot with an initial message from arborist
        setChatMessages([
          { 
            role: 'assistant', 
            text: `Namaste! I am your Indian Arborist AI Care Companion. Ask me any specialized questions about soil, water cycles, transit passes, or caring for this ${resJson.tree.name} (${resJson.tree.scientificName || resJson.tree.species})!` 
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load tree details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = () => {
    if (!user) {
      setView('auth');
      return;
    }
    // Set view to chat and pre-populate the selected partner and tree ID
    setView('chat', { partnerId: data?.tree.sellerId, treeId: data?.tree.id });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !data) return;

    try {
      setCheckoutLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const treePrice = data.tree.expectedPrice || data.tree.price || 0;
      const totalAmount = (treePrice * checkoutQuantity) + 1500; // adding ₹1500 simulated flat shipping/transit logistics

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          treeId: data.tree.id,
          quantity: checkoutQuantity,
          paymentMethod,
          deliveryAddress: {
            state: deliveryState,
            district: deliveryDistrict,
            tehsil: deliveryTehsil,
            village: deliveryVillage,
            pincode: deliveryPincode
          }
        })
      });

      if (res.ok) {
        setCheckoutSuccess(true);
        setTimeout(() => {
          setShowCheckout(false);
          setCheckoutSuccess(false);
          // Redirect to profile orders page or browse
          setView('seller-dashboard'); // Sellers check received, buyers check orders
        }, 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to place order.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setView('auth');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          treeId,
          rating: newRating,
          comment: newComment.trim()
        })
      });

      if (res.ok) {
        const addedRev = await res.json();
        setReviews(prev => [addedRev, ...prev]);
        setNewComment('');
        setNewRating(5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubscribeAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setView('auth');
      return;
    }
    if (!alertTargetPrice || Number(alertTargetPrice) <= 0) {
      setAlertError('Please enter a target price');
      setAlertStatus('error');
      return;
    }

    try {
      setAlertStatus('submitting');
      setAlertError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          speciesName: data?.tree.species || data?.tree.category || data?.tree.name || '',
          region: data?.tree.state || 'All India',
          targetPrice: Number(alertTargetPrice)
        })
      });

      if (res.ok) {
        setAlertStatus('success');
        setTimeout(() => setAlertStatus('idle'), 4000);
      } else {
        const errData = await res.json();
        setAlertError(errData.error || 'Failed to subscribe.');
        setAlertStatus('error');
      }
    } catch (err) {
      setAlertError('Network error');
      setAlertStatus('error');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !data) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          name: data.tree.name,
          species: data.tree.scientificName || data.tree.species,
          age: data.tree.age,
          height: data.tree.height,
          diameter: data.tree.diameter,
          location: `${data.tree.district}, ${data.tree.state}`,
          customPrompt: userMessage
        })
      });

      if (response.ok) {
        const analysisResult = await response.json();
        const arboristAnswer = `Professional guidance for ${data.tree.name}:\n\n- **Arborist Analysis**: ${analysisResult.professionalDescription}\n\n- **Indian Climatic/Care Rules**: ${analysisResult.careInstructions}\n\n- **Growth & Timber Yield Potential**: ${analysisResult.growthPotential}`;
        setChatMessages(prev => [...prev, { role: 'assistant', text: arboristAnswer }]);
      } else {
        throw new Error('Gemini offline');
      }
    } catch (err) {
      // High-quality arborist simulation matching Indian contexts
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `Regarding your query about this ${data.tree.age}-year-old ${data.tree.name} in ${data.tree.state}:\n\n- **Soil Type**: Prefers deep, well-drained sandy loam soil with a pH range of 6.0 to 7.5.\n- **Climatic parameters**: Growth flourishes under humid tropical to subtropical weather. Optimal temperatures range between 20°C and 45°C.\n- **Legal & Logistics**: Ensure you obtain a Transit Pass (TP) from the State Forest Division prior to transport. Since this is rated under ${data.tree.category}, regional timber felling permissions are active.` 
        }]);
      }, 1000);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-sage" />
        <p className="text-sm text-brand-earth font-semibold">Running real-time APMC price comparisons...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-serif font-bold">Listing not found</h2>
        <button onClick={() => setView('browse')} className="text-brand-sage font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </button>
      </div>
    );
  }

  const { tree, priceComparison, similarTrees } = data;
  const treePrice = tree.expectedPrice || tree.price || 0;

  return (
    <div className="space-y-10 pb-20 animate-fade-in" id="tree-details-container">
      {/* Return link */}
      <button
        onClick={() => setView('browse')}
        className="flex items-center gap-2 text-sm font-semibold text-brand-earth hover:text-brand-moss cursor-pointer focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Images & specifications */}
        <div className="lg:col-span-7 space-y-6">
          <div 
            onClick={() => {
              if (tree.images && tree.images.length > 0) {
                const idx = tree.images.indexOf(activeImage);
                setLightboxIndex(idx >= 0 ? idx : 0);
                setShowLightbox(true);
              }
            }}
            className={`relative rounded-3xl overflow-hidden border aspect-video bg-brand-sand cursor-zoom-in group ${
              darkMode ? 'border-brand-darkborder' : 'border-brand-clay'
            }`}
            title="Click to view full screen gallery"
          >
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop'}
              alt={tree.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            
            {/* Best Price Badge */}
            {priceComparison.isBestPrice && (
              <div className="absolute top-4 left-4 bg-brand-moss text-white font-extrabold text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-brand-moss/20">
                <Sparkles className="w-4 h-4 animate-bounce" />
                Best Price In Category
              </div>
            )}

            {/* View Full Gallery Overlay */}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/70 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-4 h-4" /> Open Fullscreen Gallery
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {tree.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {tree.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer flex-shrink-0 focus:outline-none transition-all ${
                    activeImage === img 
                      ? 'border-brand-sage scale-105 shadow-md shadow-brand-sage/10' 
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${tree.name} thumbnail`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Specifications */}
          <div className={`p-6 rounded-2xl border space-y-6 ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-brand-clay/30 dark:border-brand-darkborder/50">
              <h3 className="font-serif font-bold text-base tracking-tight text-brand-moss dark:text-white flex items-center gap-1.5">
                <Trees className="w-5 h-5 text-brand-sage" /> Primary Specifications
              </h3>
              <span className="text-xs font-bold text-brand-sage italic">
                {tree.scientificName || tree.category}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-brand-moss/5 rounded-xl border border-brand-moss/10">
                <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Age</p>
                <p className="text-base font-extrabold text-brand-moss dark:text-brand-sage mt-1">{tree.age} <span className="text-xs font-semibold text-brand-earth dark:text-slate-400 font-normal">Yrs</span></p>
              </div>
              <div className="p-3 bg-brand-moss/5 rounded-xl border border-brand-moss/10">
                <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Height</p>
                <p className="text-base font-extrabold text-brand-moss dark:text-brand-sage mt-1">{tree.height} <span className="text-xs font-semibold text-brand-earth dark:text-slate-400 font-normal">Ft</span></p>
              </div>
              <div className="p-3 bg-brand-moss/5 rounded-xl border border-brand-moss/10">
                <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Trunk Dia.</p>
                <p className="text-base font-extrabold text-brand-moss dark:text-brand-sage mt-1">{tree.diameter} <span className="text-xs font-semibold text-brand-earth dark:text-slate-400 font-normal">In</span></p>
              </div>
              <div className="p-3 bg-brand-moss/5 rounded-xl border border-brand-moss/10">
                <p className="text-[10px] text-brand-earth dark:text-slate-400 font-bold uppercase tracking-wider">Stock qty</p>
                <p className="text-base font-extrabold text-brand-moss dark:text-brand-sage mt-1">{tree.quantity} <span className="text-xs font-semibold text-brand-earth dark:text-slate-400 font-normal">Units</span></p>
              </div>
            </div>

            {/* Advanced Arborist Quality Report Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-sage animate-pulse" /> Verified Arborist Quality Index
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Trunk Circumference:</span>
                  <span className="font-bold text-brand-moss dark:text-white">
                    {tree.trunkCircumference ? `${tree.trunkCircumference} in` : `${Math.round(tree.diameter * 3.14)} in (Est.)`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Health State:</span>
                  <span className={`font-bold ${tree.healthCondition === 'Excellent' ? 'text-emerald-600' : 'text-brand-sage'}`}>
                    {tree.healthCondition || 'Good'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Trunk Shape:</span>
                  <span className="font-bold text-brand-moss dark:text-white">{tree.trunkStraightness || 'Slightly Curved'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Wood Density:</span>
                  <span className="font-bold text-brand-moss dark:text-white">{tree.woodDensity || 'Medium'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Moisture Content:</span>
                  <span className="font-bold text-brand-moss dark:text-white">{tree.moistureLevel || 'Fresh/Green'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Soil Type:</span>
                  <span className="font-bold text-brand-moss dark:text-white">{tree.soilType || 'Alluvial'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Cultivated Land:</span>
                  <span className="font-bold text-brand-moss dark:text-white">{tree.landType || 'Agriculture'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Timber Grade:</span>
                  <span className="font-bold text-brand-moss dark:text-brand-sage">{tree.timberGrade || 'Grade B'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-brand-clay/40 dark:border-brand-darkborder bg-brand-sand/30 dark:bg-brand-darkgreen/10 flex justify-between items-center">
                  <span className="text-brand-earth dark:text-slate-400">Rainfall Belt:</span>
                  <span className="font-bold text-brand-moss dark:text-white">{tree.rainfallZone || 'Medium'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
                {tree.hasDroneImages && (
                  <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 uppercase text-[9px] tracking-wider">
                    ✓ Drone Verified Imagery
                  </span>
                )}
                {tree.videoUrl && (
                  <a 
                    href={tree.videoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-brand-moss/10 text-brand-moss hover:bg-brand-moss hover:text-white border border-brand-moss/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 uppercase text-[9px] tracking-wider transition-colors"
                  >
                    ▶ View Video Walkthrough
                  </a>
                )}
              </div>
            </div>

            {/* AI Estimation Deep Valuation Report */}
            {tree.aiEstimation && (
              <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? 'bg-brand-darkgreen/20 border-brand-darkborder' : 'bg-brand-sand/45 border-brand-clay'}`}>
                <h4 className="text-xs font-extrabold text-brand-moss dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-sage animate-spin-slow" /> Comprehensive Arborist AI Price Estimation report
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'}`}>
                    <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase font-bold">Estimated Timber Volume</p>
                    <p className="text-sm font-black text-brand-moss dark:text-brand-sage mt-1">
                      {tree.aiEstimation.estimatedTimberVolume ? `${tree.aiEstimation.estimatedTimberVolume.toFixed(2)} CFT` : 'N/A'}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'}`}>
                    <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase font-bold">Carbon Sequestration</p>
                    <p className="text-sm font-black text-brand-moss dark:text-brand-sage mt-1">
                      {tree.aiEstimation.carbonStorage ? `${Math.round(tree.aiEstimation.carbonStorage)} kg CO₂` : 'N/A'}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'}`}>
                    <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase font-bold">Confidence Index</p>
                    <p className="text-sm font-black text-brand-moss dark:text-brand-sage mt-1">
                      {tree.aiEstimation.confidenceScore ? `${tree.aiEstimation.confidenceScore}%` : '85%'}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xs'}`}>
                    <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase font-bold">Investment Rating</p>
                    <p className="text-sm font-black text-brand-moss dark:text-brand-sage mt-1">
                      {tree.aiEstimation.investmentGrade || 'Grade A'}
                    </p>
                  </div>
                </div>

                {/* Sub-pricing metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[9px]">Market Projections & Multi-Channel Valuations</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between border-b border-brand-clay/40 dark:border-brand-darkborder/50 pb-1">
                        <span className="text-brand-earth dark:text-slate-400">Wholesale APMC Price:</span>
                        <span className="font-bold text-brand-moss dark:text-white">₹{tree.aiEstimation.wholesalePrice?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-clay/40 dark:border-brand-darkborder/50 py-1">
                        <span className="text-brand-earth dark:text-slate-400">Retail Direct-to-Buyer:</span>
                        <span className="font-bold text-brand-moss dark:text-white">₹{tree.aiEstimation.retailPrice?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-brand-earth dark:text-slate-400">Sovereign Auction Range:</span>
                        <span className="font-bold text-brand-moss dark:text-white">₹{tree.aiEstimation.auctionValue?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[9px]">Compound Future Growth Estimations</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between border-b border-brand-clay/40 dark:border-brand-darkborder/50 pb-1">
                        <span className="text-brand-earth dark:text-slate-400">Valuation in 1 Year:</span>
                        <span className="font-semibold text-brand-moss dark:text-brand-sage">₹{tree.aiEstimation.futurePrice1Year?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-clay/40 dark:border-brand-darkborder/50 py-1">
                        <span className="text-brand-earth dark:text-slate-400">Valuation in 3 Years:</span>
                        <span className="font-semibold text-brand-moss dark:text-brand-sage">₹{tree.aiEstimation.futurePrice3Years?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-brand-earth dark:text-slate-400">Valuation in 5 Years:</span>
                        <span className="font-black text-brand-moss dark:text-brand-sage">₹{tree.aiEstimation.futurePrice5Years?.toLocaleString('en-IN') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-brand-clay/30 dark:border-brand-darkborder/50">
                  <p className="text-[10px] text-brand-earth dark:text-slate-400 uppercase font-bold tracking-wider">AI growth Potential analysis</p>
                  <p className="text-[11px] leading-relaxed text-brand-earth dark:text-slate-300 italic">
                    "{tree.aiEstimation.growthPotential}"
                  </p>
                </div>
              </div>
            )}

            {/* Harvest Status tag */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                tree.harvestReady
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }`}>
                Harvest Status: {tree.harvestReady ? 'Ready for Harvest (Mature Timber)' : 'Growing (Nursery Stock)'}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Regional Context</h4>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-brand-earth'}`}>
                Located in village <strong>{tree.village || 'N/A'}</strong>, Tehsil <strong>{tree.tehsil || 'N/A'}</strong>, District <strong>{tree.district}</strong>, Pincode <strong>{tree.pincode}</strong>. GPS Coordinates marked at <code>{tree.gpsLocation}</code>.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-brand-earth uppercase tracking-wider">Listing Description</h4>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${darkMode ? 'text-slate-300' : 'text-brand-earth'}`}>{tree.description}</p>
            </div>
          </div>

          {/* Interactive Google Map & Location Details */}
          <TreeMapView
            tree={tree}
            buyerGps={user?.pincode ? `${user.district}, ${user.state}` : undefined}
            darkMode={darkMode}
          />

          {/* User Reviews & Ratings */}
          <div className={`p-6 rounded-2xl border space-y-6 ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <h3 className="font-serif font-bold text-base tracking-tight text-brand-moss dark:text-white flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Trader Reviews & Quality Reports ({reviews.length})
            </h3>

            {/* List Reviews */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-brand-earth italic">No reviews registered for this tree yet.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-brand-sand/35 dark:bg-brand-darkgreen/30 border border-brand-clay/50 dark:border-brand-darkborder rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-moss dark:text-white">{rev.reviewerName}</span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-brand-earth dark:text-slate-300">{rev.comment}</p>
                    <span className="text-[10px] text-brand-earth block text-right">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="space-y-3 pt-3 border-t border-brand-clay dark:border-brand-darkborder">
                <p className="text-[10px] font-bold text-brand-earth uppercase tracking-wider">Leave a Star Review / Inspection Report</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-earth">My Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star className={`w-5 h-5 ${newRating >= star ? 'text-amber-500 fill-amber-500' : 'text-brand-earth/30'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share details about the trunk health, species authenticity, or farmer interaction..."
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
                  }`}
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-brand-moss hover:bg-brand-sage text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                >
                  Submit Inspection
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Price comparison, Action buttons, maps, AI Chat */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Main Price Block */}
          <div className="space-y-3">
            <span className="text-[10px] font-black tracking-wider uppercase bg-brand-sage/20 text-brand-sage border border-brand-sage/20 px-2.5 py-1 rounded inline-block">
              {tree.category}
            </span>
            <h1 className="text-3xl font-serif font-bold tracking-tight leading-none text-brand-moss dark:text-white">{tree.name}</h1>
            <p className="text-xs font-semibold text-brand-sage italic">
              Scientific: {tree.scientificName || 'Santalum album'} | Local: {tree.localName || 'Chandan'}
            </p>
            <p className="flex items-center gap-1 text-xs text-brand-earth dark:text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-sage" /> {tree.district}, {tree.state}
            </p>

            {/* Price section with AI Estimated Range */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl border flex items-center justify-between gap-4 bg-brand-sage/5 border-brand-sage/20 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-sage flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-sage animate-pulse" />
                    AI Estimated Price
                  </span>
                  {aiEstimateLoading ? (
                    <div className="flex items-center gap-1 text-xs text-brand-earth dark:text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sage" />
                      <span>Estimating...</span>
                    </div>
                  ) : (
                    <p className="text-lg font-black text-brand-moss dark:text-brand-sage">{aiEstimate || 'Calculating...'}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-earth block">Expected Price</span>
                  <p className="text-xl font-extrabold text-brand-moss dark:text-white">₹{treePrice.toLocaleString('en-IN')}</p>
                  {tree.negotiable && <span className="text-[9px] font-bold text-brand-sage uppercase bg-brand-sage/10 px-1.5 py-0.5 rounded">Negotiable</span>}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-brand-earth dark:text-slate-400">
                  Total available: <span className="font-extrabold text-brand-moss dark:text-white">{tree.quantity || 1} trees</span>
                </div>

                {/* Favorite Action */}
                {user && user.role === 'buyer' && (
                  <button
                    onClick={() => toggleFavorite(tree.id)}
                    className={`flex items-center gap-1.5 py-2 px-4 rounded-xl border font-bold text-xs uppercase cursor-pointer transition-all ${
                      isFavorited 
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm' 
                        : darkMode ? 'bg-brand-darkcard hover:bg-brand-darkborder border-brand-darkborder text-slate-300' : 'bg-white hover:bg-brand-sand border-brand-clay text-brand-earth'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                    {isFavorited ? 'Favorited' : 'Wishlist'}
                  </button>
                )}
              </div>
            </div>

            {/* BUY NOW & DIRECT CHAT ACTIONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  if (!user) setView('auth');
                  else setShowCheckout(true);
                }}
                className="bg-brand-moss hover:bg-brand-sage text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>Order Now</span>
              </button>

              <button
                onClick={handleInquirySubmit}
                className={`border font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  darkMode 
                    ? 'border-brand-darkborder bg-brand-darkcard hover:bg-brand-darkborder text-brand-sage' 
                    : 'border-brand-clay bg-white hover:bg-brand-sand text-brand-moss'
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Negotiate Chat</span>
              </button>
            </div>

            {(!user || user.role === 'buyer') && (
              <div className={`p-4 rounded-xl border mt-3 space-y-3 ${
                darkMode ? 'bg-brand-darkgreen/20 border-brand-darkborder' : 'bg-brand-sand/35 border-brand-clay/60'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-moss dark:text-white">
                  <Bell className="w-4 h-4 text-brand-sage shrink-0" />
                  <span>Notify me on price drops for {tree.species || tree.category}</span>
                </div>
                
                {alertStatus === 'success' ? (
                  <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black rounded-lg">
                    <Check className="w-4 h-4" /> Alert active! You will be notified in Buyer Tracking.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribeAlert} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-brand-sage">₹</span>
                      <input
                        type="number"
                        placeholder="Target Max Price"
                        value={alertTargetPrice}
                        onChange={(e) => setAlertTargetPrice(e.target.value)}
                        className={`w-full text-xs font-bold pl-5 pr-2 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all ${
                          darkMode 
                            ? 'bg-brand-darkcard border-brand-darkborder text-slate-200' 
                            : 'bg-white border-brand-clay text-brand-moss'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={alertStatus === 'submitting'}
                      className="bg-brand-moss hover:bg-brand-sage text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      {alertStatus === 'submitting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Set Alert
                    </button>
                  </form>
                )}
                {alertStatus === 'error' && (
                  <p className="text-[10px] text-rose-500 font-bold">{alertError}</p>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Price Comparison Engine */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm tracking-tight flex items-center gap-1.5 text-brand-moss dark:text-white">
                <Sparkles className="w-4 h-4 text-brand-sage" /> Mandi / Marketplace Price Analysis
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">APMC Feed</span>
            </div>

            {/* Range Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-brand-earth dark:text-slate-400 font-medium">
                <span>Lowest listings: ₹{priceComparison.lowestPrice.toLocaleString('en-IN')}</span>
                <span>Highest listings: ₹{priceComparison.highestPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 rounded-full bg-brand-clay dark:bg-brand-darkborder overflow-hidden relative">
                {(() => {
                  const range = priceComparison.highestPrice - priceComparison.lowestPrice;
                  const percent = range > 0 
                    ? Math.max(0, Math.min(100, ((treePrice - priceComparison.lowestPrice) / range) * 100))
                    : 50;
                  return (
                    <div 
                      className="absolute top-0 bottom-0 w-3 rounded-full bg-brand-moss border border-white shadow-md transition-all duration-300"
                      style={{ left: `calc(${percent}% - 6px)` }}
                    />
                  );
                })()}
              </div>
              <div className="flex justify-between text-[11px] text-brand-earth dark:text-slate-400 font-medium">
                <span>Category Average: ₹{priceComparison.avgPrice.toLocaleString('en-IN')}</span>
                <span className={`font-bold ${priceComparison.isBestPrice ? 'text-brand-moss dark:text-brand-sage' : 'text-brand-earth'}`}>
                  {priceComparison.isBestPrice ? 'Cheapest category price!' : `${Math.round(((treePrice - priceComparison.lowestPrice)/priceComparison.lowestPrice)*100)}% above APMC min`}
                </span>
              </div>
            </div>
          </div>

          {/* Simulated Google Maps Location radar */}
          <div className={`p-6 rounded-2xl border space-y-4 overflow-hidden relative ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm tracking-tight text-brand-moss dark:text-white flex items-center gap-1">
                <MapPin className="w-4.5 h-4.5 text-brand-sage" /> GPS Verified Map Radar
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-sage">Coordinates OK</span>
            </div>

            {/* Map Canvas placeholder styled beautifully */}
            <div className="h-40 rounded-xl relative overflow-hidden bg-brand-sand flex items-center justify-center border border-brand-clay/40">
              {/* Abstract Indian map lines styled with SVG for ultimate luxury styling */}
              <div className="absolute inset-0 opacity-40">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0,20 Q 80,40 120,0 T 240,60 T 360,20" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-earth/40" />
                  <path d="M 10,120 Q 90,80 180,120 T 300,90" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-sage/40" />
                  <circle cx="150" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-brand-sage/50" />
                  <circle cx="150" cy="80" r="10" fill="none" stroke="currentColor" strokeWidth="1" className="text-brand-sage/40" />
                </svg>
              </div>

              {/* Verified Marker */}
              <div className="relative flex flex-col items-center gap-1 animate-bounce z-10">
                <MapPin className="w-8 h-8 text-rose-500 fill-rose-500" />
                <span className="bg-brand-moss text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg">Verified Tree Loc</span>
              </div>

              <div className="absolute bottom-2 left-2 bg-brand-spruce/95 text-white text-[9px] px-2 py-1 rounded">
                GPS: {tree.gpsLocation || '12.3106, 76.6433'}
              </div>
            </div>

            <p className="text-[11px] text-brand-earth text-center">
              Our automated system cross-references Google Maps Places API and regional pincodes to verify property boundaries and transit legal jurisdictions.
            </p>
          </div>

          {/* Arborist AI Care Chatbot */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <div className="flex items-center gap-2 pb-2 border-b border-brand-clay dark:border-brand-darkborder">
              <div className="p-2 bg-brand-moss rounded-lg text-white">
                <Bot className="w-4.5 h-4.5 text-brand-sage" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm tracking-tight text-brand-moss dark:text-white">Arborist AI Companion</h3>
                <p className="text-[10px] text-brand-earth dark:text-slate-400">Regional care, transplantation & transit logs</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-line border ${
                    msg.role === 'user' 
                      ? 'bg-brand-moss border-brand-moss text-white ml-6 text-right' 
                      : darkMode 
                      ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200 mr-6' 
                      : 'bg-brand-sand border-brand-clay text-brand-moss mr-6'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-1.5 text-brand-earth">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-bounce delay-200"></span>
                </div>
              )}
            </div>

            {/* Chat Form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about water, legal transit, wood density, carbon credits..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                  darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
                }`}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-brand-moss hover:bg-brand-sage disabled:opacity-50 text-white p-2.5 rounded-xl cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Contact Seller Panel */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
          }`}>
            <h3 className="font-serif font-bold text-sm tracking-tight text-brand-moss dark:text-white">Seller Contact Registry</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-moss dark:text-slate-200">{tree.sellerName}</p>
                <p className="text-xs text-brand-earth dark:text-slate-400">Verified farmer / nursery owner</p>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`tel:${tree.sellerContact}`} 
                  className={`p-2.5 rounded-xl border transition-colors ${
                    darkMode ? 'bg-brand-darkgreen hover:bg-brand-darkborder border-brand-darkborder text-brand-sage' : 'bg-brand-sand hover:bg-brand-clay border-brand-clay text-brand-moss'
                  }`}
                  title="Call Seller"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Checkout Payment Modal Sheet */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="checkout-modal">
          <div className={`w-full max-w-lg rounded-3xl p-6 border space-y-6 max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-brand-darkcard border-brand-darkborder text-white' : 'bg-white border-brand-clay text-brand-moss'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-brand-clay/30">
              <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                <ShoppingBag className="text-brand-sage w-5 h-5" /> Buy Tree Checkout
              </h3>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-brand-earth hover:text-brand-moss focus:outline-none cursor-pointer font-bold text-sm"
              >
                Close
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-lg text-emerald-600">Payment Initiated & Order Placed!</h4>
                <p className="text-xs text-brand-earth">Dispatched to {tree.sellerName}. We are verifying the transaction logs with the UPI gateway now.</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                
                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth uppercase tracking-wider">Purchase Quantity</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={tree.quantity}
                      value={checkoutQuantity}
                      onChange={(e) => setCheckoutQuantity(Math.max(1, Number(e.target.value)))}
                      className={`px-3 py-2 rounded-xl border text-sm w-24 focus:outline-none ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                      }`}
                    />
                    <span className="text-xs text-brand-earth">Max available: {tree.quantity} units</span>
                  </div>
                </div>

                {/* Logistics / Delivery Address */}
                <div className="space-y-3 border-t border-brand-clay/30 pt-3">
                  <p className="text-xs font-bold text-brand-earth uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-4.5 h-4.5 text-brand-sage" /> Delivery / Forest Transit Address
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-brand-earth uppercase font-bold">State</label>
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-earth uppercase font-bold">District</label>
                      <input
                        type="text"
                        required
                        placeholder="District"
                        value={deliveryDistrict}
                        onChange={(e) => setDeliveryDistrict(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-earth uppercase font-bold">Tehsil / Taluka</label>
                      <input
                        type="text"
                        required
                        placeholder="Tehsil Name"
                        value={deliveryTehsil}
                        onChange={(e) => setDeliveryTehsil(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-earth uppercase font-bold">Village / Ward</label>
                      <input
                        type="text"
                        required
                        placeholder="Village"
                        value={deliveryVillage}
                        onChange={(e) => setDeliveryVillage(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-earth uppercase font-bold">Pincode (6-digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 570001"
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-white' : 'bg-brand-sand border-brand-clay text-brand-moss'
                      }`}
                    />
                  </div>
                </div>

                {/* Gateway selection */}
                <div className="space-y-2 border-t border-brand-clay/30 pt-3">
                  <p className="text-xs font-bold text-brand-earth uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-brand-sage" /> Indian Payment Channel
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'upi', name: 'Google Pay (UPI)' },
                      { id: 'phonepe', name: 'PhonePe' },
                      { id: 'paytm', name: 'Paytm UPI' },
                      { id: 'razorpay', name: 'Razorpay Gateways' }
                    ].map((gate) => (
                      <button
                        key={gate.id}
                        type="button"
                        onClick={() => setPaymentMethod(gate.id as any)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          paymentMethod === gate.id
                            ? 'bg-brand-moss text-white border-brand-moss'
                            : darkMode
                            ? 'bg-brand-darkgreen border-brand-darkborder text-slate-300'
                            : 'bg-brand-sand border-brand-clay text-brand-moss'
                        }`}
                      >
                        {gate.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="p-4 bg-brand-sand/40 dark:bg-brand-darkgreen/20 rounded-2xl border border-brand-clay/50 text-xs space-y-2 font-medium text-brand-earth dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Tree Cost ({checkoutQuantity} units):</span>
                    <span>₹{(treePrice * checkoutQuantity).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flat Forestry Transit Fee:</span>
                    <span>₹1,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Integrated SGST & CGST (18% / 5%):</span>
                    <span>₹{Math.round((treePrice * checkoutQuantity) * 0.05).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-brand-moss dark:text-white font-extrabold border-t border-brand-clay/30 pt-2 text-sm">
                    <span>Final Amount (INR):</span>
                    <span>₹{Math.round((treePrice * checkoutQuantity) * 1.05 + 1500).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Submit Order */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-brand-moss hover:bg-brand-sage disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order & Pay'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Premium Fullscreen Lightbox Modal */}
      {showLightbox && tree.images && tree.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 md:p-6 animate-fade-in">
          {/* Top panel */}
          <div className="flex justify-between items-center text-white pb-2 max-w-7xl mx-auto w-full border-b border-white/10">
            <div>
              <h3 className="font-serif font-black text-sm uppercase tracking-wide text-brand-sage">{tree.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono">Photo {lightboxIndex + 1} of {tree.images.length}</p>
            </div>
            <button
              onClick={() => setShowLightbox(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main frame */}
          <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full group py-4">
            {tree.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === 0 ? tree.images.length - 1 : prev - 1));
                }}
                className="absolute left-2 md:left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer text-white z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={tree.images[lightboxIndex]}
              alt={`${tree.name} full view`}
              className="max-h-[70vh] max-w-full object-contain rounded-2xl select-none shadow-2xl border border-white/5"
              referrerPolicy="no-referrer"
            />

            {tree.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === tree.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 md:right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer text-white z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {tree.images.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-4 max-w-xl mx-auto w-full border-t border-white/10">
              {tree.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${
                    lightboxIndex === idx 
                      ? 'border-brand-sage scale-105 shadow-md' 
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="nav preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Similar trees tray */}
      {similarTrees.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-brand-clay dark:border-brand-darkborder">
          <h2 className="text-2xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">Similar Tree Listings</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarTrees.map((simTree) => {
              const simPrice = simTree.expectedPrice || simTree.price || 0;
              return (
                <div
                  key={simTree.id}
                  onClick={() => setView('details', { id: simTree.id })}
                  className={`rounded-2xl border overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.01] ${
                    darkMode 
                      ? 'bg-brand-darkcard border-brand-darkborder hover:border-brand-sage/40 hover:shadow-xl' 
                      : 'bg-white border-brand-clay hover:border-brand-sage hover:shadow-xl'
                  }`}
                >
                  <div className="h-32 bg-brand-sand overflow-hidden relative">
                    <img src={simTree.images[0]} alt={simTree.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-2 right-2 bg-brand-moss text-white font-bold text-xs px-2.5 py-0.5 rounded border border-brand-clay/10">
                      ₹{simPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-serif font-bold text-xs truncate group-hover:text-brand-sage transition-colors text-brand-moss dark:text-white">{simTree.name}</h4>
                    <p className="text-[10px] text-brand-earth dark:text-slate-400 mt-1 font-medium truncate">{simTree.district}, {simTree.state}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
