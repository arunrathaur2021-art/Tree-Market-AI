import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Plus, Pencil, Trash2, Check, AlertCircle, Sparkles, Upload, X, RefreshCw, ShoppingBag, DollarSign, Trees, ClipboardList, MapPin, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { Tree, User, AIEstimationResult } from '../types';
import IndiaLocationSelect from './IndiaLocationSelect';
import LocationPickerMap from './LocationPickerMap';

interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  treeId: string;
  treeName: string;
  pricePerTree: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'upi' | 'phonepe' | 'gpay' | 'paytm' | 'razorpay';
  deliveryAddress: {
    state: string;
    district: string;
    tehsil: string;
    village: string;
    pincode: string;
  };
  createdAt: string;
}

interface SellerDashboardViewProps {
  user: User | null;
  darkMode: boolean;
  setView: (view: string, params?: any) => void;
}

const INDIAN_STATES_UT = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const TREE_CATEGORIES = [
  "Teak (Sagwan)", "Sandalwood", "Eucalyptus", "Shisham", "Bamboo", "Poplar", "Mango", "Melia Dubia", 
  "Gmelina", "Silver Oak", "Casuarina", "Acacia", "Sal", "Arjun", "Neem", "Karanj", "Guava", "Coconut", 
  "Jamun", "Lemon", "Orange", "Amla", "Tamarind", "Jackfruit", "Banana", "Litchi", "Ashoka", "Bael", 
  "Moringa", "Peepal", "Banyan", "Timber Trees", "Fruit Trees", "Medicinal Trees", "Sacred Trees"
];

export default function SellerDashboardView({ user, darkMode, setView }: SellerDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'analytics'>('listings');
  const [listings, setListings] = useState<Tree[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [localName, setLocalName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('Teak (Sagwan)');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [diameter, setDiameter] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [harvestReady, setHarvestReady] = useState(false);
  const [description, setDescription] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [tehsil, setTehsil] = useState('');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [gpsLocation, setGpsLocation] = useState('12.3106, 76.6433');
  const [images, setImages] = useState<string[]>([]);

  // Detailed Indian Arborist Attributes
  const [trunkCircumference, setTrunkCircumference] = useState('');
  const [healthCondition, setHealthCondition] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Good');
  const [growthRate, setGrowthRate] = useState<'Slow' | 'Moderate' | 'Fast'>('Moderate');
  const [trunkStraightness, setTrunkStraightness] = useState<'Very Straight' | 'Slightly Curved' | 'Crooked'>('Slightly Curved');
  const [woodDensity, setWoodDensity] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [moistureLevel, setMoistureLevel] = useState<'Dry' | 'Semi-dry' | 'Fresh/Green'>('Fresh/Green');
  const [timberGrade, setTimberGrade] = useState<'Grade A' | 'Grade B' | 'Grade C'>('Grade B');
  const [landType, setLandType] = useState<'Agriculture' | 'Forest' | 'Wasteland' | 'Residential' | 'Commercial'>('Agriculture');
  const [soilType, setSoilType] = useState<'Alluvial' | 'Black' | 'Red' | 'Laterite' | 'Sandy' | 'Clayey'>('Alluvial');
  const [rainfallZone, setRainfallZone] = useState<'Low' | 'Medium' | 'High' | 'Heavy'>('Medium');
  const [hasDroneImages, setHasDroneImages] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Drag-and-drop / upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Optimizer States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState('');

  // Status flags
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSellerListings();
    fetchSellerOrders();
  }, [user]);

  const fetchSellerListings = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const res = await fetch(`/api/trees?sellerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/orders/seller', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLocalName('');
    setScientificName('');
    setCategory('Teak (Sagwan)');
    setAge('');
    setHeight('');
    setDiameter('');
    setQuantity('');
    setExpectedPrice('');
    setNegotiable(true);
    setHarvestReady(false);
    setDescription('');
    setState(user?.state || 'Karnataka');
    setDistrict(user?.district || '');
    setTehsil('');
    setVillage('');
    setPincode(user?.pincode || '');
    setGpsLocation('12.3106, 76.6433');
    setImages([]);
    
    // Arborist fields reset
    setTrunkCircumference('');
    setHealthCondition('Good');
    setGrowthRate('Moderate');
    setTrunkStraightness('Slightly Curved');
    setWoodDensity('Medium');
    setMoistureLevel('Fresh/Green');
    setTimberGrade('Grade B');
    setLandType('Agriculture');
    setSoilType('Alluvial');
    setRainfallZone('Medium');
    setHasDroneImages(false);
    setVideoUrl('');

    setEditingTree(null);
    setAiResult(null);
    setAiError('');
    setFormError('');
  };

  const handleOpenAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEditForm = (tree: Tree) => {
    resetForm();
    setEditingTree(tree);
    setName(tree.name);
    setLocalName(tree.localName || '');
    setScientificName(tree.scientificName || '');
    setCategory(tree.category || 'Teak (Sagwan)');
    setAge(tree.age.toString());
    setHeight(tree.height.toString());
    setDiameter(tree.diameter.toString());
    setQuantity(tree.quantity.toString());
    setExpectedPrice((tree.expectedPrice || tree.price || 0).toString());
    setNegotiable(tree.negotiable !== false);
    setHarvestReady(!!tree.harvestReady);
    setDescription(tree.description);
    setState(tree.state);
    setDistrict(tree.district);
    setTehsil(tree.tehsil || '');
    setVillage(tree.village || '');
    setPincode(tree.pincode);
    setGpsLocation(tree.gpsLocation || '12.3106, 76.6433');
    setImages(tree.images);

    // Populate arborist inputs
    setTrunkCircumference(tree.trunkCircumference?.toString() || '');
    setHealthCondition(tree.healthCondition || 'Good');
    setGrowthRate(tree.growthRate || 'Moderate');
    setTrunkStraightness(tree.trunkStraightness || 'Slightly Curved');
    setWoodDensity(tree.woodDensity || 'Medium');
    setMoistureLevel(tree.moistureLevel || 'Fresh/Green');
    setTimberGrade(tree.timberGrade || 'Grade B');
    setLandType(tree.landType || 'Agriculture');
    setSoilType(tree.soilType || 'Alluvial');
    setRainfallZone(tree.rainfallZone || 'Medium');
    setHasDroneImages(!!tree.hasDroneImages);
    setVideoUrl(tree.videoUrl || '');
    
    if (tree.aiEstimation) {
      setAiResult(tree.aiEstimation);
    }
    setShowForm(true);
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this listing permanently?')) return;
    try {
      const res = await fetch(`/api/trees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setSuccessMsg('Tree listing permanently removed from marketplace.');
        fetchSellerListings();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete listing');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setSuccessMsg(`Order successfully updated to "${status}"!`);
        fetchSellerOrders();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client-side image compression utility
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimension 1200px
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Drag & drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: FileList) => {
    setUploadError('');
    const fileList = Array.from(files);

    if (images.length + fileList.length > 10) {
      setUploadError('Maximum 10 images are allowed for a tree listing.');
      return;
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    setIsUploading(true);

    for (const file of fileList) {
      // 1. Format check
      if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
        setUploadError(`Invalid file type for ${file.name}. Only JPG, JPEG, PNG, and WEBP are supported.`);
        continue;
      }

      // 2. Size check (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} is larger than 5 MB.`);
        continue;
      }

      try {
        // 3. Compress Client-side
        const compressedBase64 = await compressImage(file);

        // 4. Upload to backend
        const token = localStorage.getItem('token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          body: JSON.stringify({ base64Data: compressedBase64 })
        });

        if (res.ok) {
          const result = await res.json();
          // Store the final static image URL from the server
          setImages((prev) => [...prev, result.url]);
        } else {
          const errData = await res.json();
          setUploadError(`Failed to upload ${file.name}: ${errData.error || 'Server error'}`);
        }
      } catch (err) {
        console.error('Image compression or upload error:', err);
        setUploadError(`Error processing ${file.name}.`);
      }
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImage = (index: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const result = [...images];
    const [removed] = result.splice(index, 1);
    result.splice(targetIndex, 0, removed);
    setImages(result);
  };

  // Run Gemini AI optimization
  const handleAIEstimation = async () => {
    if (!name.trim()) {
      setAiError('Please fill in Name field first so the Arborist AI can analyze your listing.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          category,
          species: scientificName || category,
          age: Number(age) || 5,
          height: Number(height) || 10,
          diameter: Number(diameter) || 3,
          quantity: Number(quantity) || 1,
          location: `${district || 'Mysuru'}, ${state || 'Karnataka'}`,
          state,
          district,
          trunkCircumference: trunkCircumference ? Number(trunkCircumference) : undefined,
          healthCondition,
          growthRate,
          trunkStraightness,
          woodDensity,
          moistureLevel,
          timberGrade,
          landType,
          soilType,
          rainfallZone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      } else {
        const err = await res.json();
        setAiError(err.error || 'Gemini AI was unable to complete estimation at this time.');
      }
    } catch (err) {
      setAiError('Failed to contact Gemini pricing intelligence module.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIDescription = () => {
    if (!aiResult) return;
    setDescription(aiResult.professionalDescription);
  };

  const applyAIPrice = () => {
    if (!aiResult) return;
    if (aiResult.expectedMarketPrice) {
      setExpectedPrice(aiResult.expectedMarketPrice.toString());
    } else {
      const matches = aiResult.suggestedPriceRange?.match(/\d+/g);
      if (matches && matches.length > 0) {
        setExpectedPrice(matches[0]);
      }
    }
  };

  const appendAICareInstructions = () => {
    if (!aiResult) return;
    setDescription(prev => `${prev}\n\n[Indian Arborist Care Guide]\n${aiResult.careInstructions}`);
  };

  // Submit listing to backend (Create or Update)
  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !category || !age || !height || !diameter || !quantity || !expectedPrice || !state || !district || !pincode) {
      setFormError('Please fill out all required attributes.');
      return;
    }

    const payload = {
      name,
      localName,
      scientificName,
      category,
      age: Number(age),
      height: Number(height),
      diameter: Number(diameter),
      quantity: Number(quantity),
      expectedPrice: Number(expectedPrice),
      negotiable,
      harvestReady,
      description: description || `Healthy ${name} tree ready for trade.`,
      state,
      district,
      tehsil,
      village,
      pincode,
      gpsLocation,
      images,

      // Detailed Arborist fields
      species: scientificName || category,
      trunkCircumference: trunkCircumference ? Number(trunkCircumference) : undefined,
      healthCondition,
      growthRate,
      trunkStraightness,
      woodDensity,
      moistureLevel,
      timberGrade,
      landType,
      soilType,
      rainfallZone,
      hasDroneImages,
      videoUrl,
      aiEstimation: aiResult || undefined
    };

    const endpoint = editingTree ? `/api/trees/${editingTree.id}` : '/api/trees';
    const method = editingTree ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(editingTree ? 'Listing updated successfully!' : 'Listing published to tree marketplace!');
        setShowForm(false);
        resetForm();
        fetchSellerListings();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        setFormError(err.error || 'Failed to submit tree listing');
      }
    } catch (err) {
      setFormError('Network communication failure.');
    }
  };

  // Calculations for Earnings Analytics Tab
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-8 pb-16 animate-fade-in" id="seller-dashboard-container">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-2 text-brand-moss dark:text-white">
            <LayoutDashboard className="w-8 h-8 text-brand-sage" /> Seller Central
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-brand-earth'}`}>
            Manage listings, dispatch incoming orders, and run arborist price calibrations across India.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-1.5 bg-brand-moss hover:bg-brand-sage text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer transition-colors shadow-lg shadow-brand-moss/10"
            id="add-listing-btn"
          >
            <Plus className="w-4 h-4" /> Add Tree Listing
          </button>
        )}
      </div>

      {/* Navigation Tabs (Only when not showing listing form) */}
      {!showForm && (
        <div className={`flex border-b ${darkMode ? 'border-brand-darkborder' : 'border-brand-clay'}`}>
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-3 px-6 text-sm font-serif font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'listings'
                ? 'border-brand-sage text-brand-sage'
                : 'border-transparent text-brand-earth hover:text-brand-moss'
            }`}
          >
            My Tree Stock ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 text-sm font-serif font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-brand-sage text-brand-sage'
                : 'border-transparent text-brand-earth hover:text-brand-moss'
            }`}
          >
            Received Trade Orders ({orders.length})
            {pendingOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-6 text-sm font-serif font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'analytics'
                ? 'border-brand-sage text-brand-sage'
                : 'border-transparent text-brand-earth hover:text-brand-moss'
            }`}
          >
            Earnings & APMC Volume
          </button>
        </div>
      )}

      {/* Success Notifications */}
      {successMsg && (
        <div className="p-4 bg-brand-sage/15 text-brand-moss dark:text-brand-sage border border-brand-sage/30 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse">
          <Check className="w-5 h-5" /> {successMsg}
        </div>
      )}

      {/* Listing Creation / Editing Form overlay */}
      {showForm ? (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-xl shadow-brand-sand/40'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-brand-clay dark:border-brand-darkborder">
            <h2 className="text-lg font-serif font-bold tracking-tight text-brand-moss dark:text-white">
              {editingTree ? 'Edit Indian Tree Listing Details' : 'Add New Tree Listing (APMC Registration)'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-brand-earth hover:text-rose-500 p-1 rounded-lg focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <form onSubmit={handleSubmitListing} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Attributes Inputs */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Tree Listing Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Mysore Sandalwood Logs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Local Vernacular Name (e.g. Chandan) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sagwan / Hapus Aam / Chandan"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Scientific / Botanical Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Santalum album / Tectona grandis"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Category Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss'
                    }`}
                  >
                    {TREE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Age (Yrs) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Height (Ft) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 18"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Trunk Dia (In) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 6.5"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>
              </div>

              {/* Indian Arborist Specifications */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-brand-darkgreen/20 border-brand-darkborder' : 'bg-brand-sand/50 border-brand-clay'} space-y-4`}>
                <h4 className="text-xs font-bold text-brand-moss dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-sage animate-pulse" /> Advanced Indian Arborist Specifications (Highly Recommended for AI Precision)
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {/* Trunk Circumference */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Trunk Circ. (Inches)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 20"
                      value={trunkCircumference}
                      onChange={(e) => setTrunkCircumference(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200 animate-none' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    />
                  </div>

                  {/* Health Condition */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Health Condition</label>
                    <select
                      value={healthCondition}
                      onChange={(e) => setHealthCondition(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Excellent">Excellent (Healthy)</option>
                      <option value="Good">Good (Minor pests)</option>
                      <option value="Fair">Fair (Dry branch/leaf loss)</option>
                      <option value="Poor">Poor (Diseased/Damaged)</option>
                    </select>
                  </div>

                  {/* Growth Rate */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Growth Rate</label>
                    <select
                      value={growthRate}
                      onChange={(e) => setGrowthRate(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Slow">Slow</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Fast">Fast</option>
                    </select>
                  </div>

                  {/* Trunk Straightness */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Trunk Straightness</label>
                    <select
                      value={trunkStraightness}
                      onChange={(e) => setTrunkStraightness(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Very Straight">Very Straight (Prime Timber)</option>
                      <option value="Slightly Curved">Slightly Curved</option>
                      <option value="Crooked">Crooked (Low Timber Yield)</option>
                    </select>
                  </div>

                  {/* Wood Density */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Wood Density</label>
                    <select
                      value={woodDensity}
                      onChange={(e) => setWoodDensity(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="High">High (Teak/Sandalwood)</option>
                      <option value="Medium">Medium (Acacia/Mango)</option>
                      <option value="Low">Low (Poplar/Eucalyptus)</option>
                    </select>
                  </div>

                  {/* Moisture Level */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Moisture Level</label>
                    <select
                      value={moistureLevel}
                      onChange={(e) => setMoistureLevel(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Fresh/Green">Fresh/Green (Standing Tree)</option>
                      <option value="Semi-dry">Semi-dry (Partially dried)</option>
                      <option value="Dry">Dry (Felled log)</option>
                    </select>
                  </div>

                  {/* Timber Grade */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Timber Grade</label>
                    <select
                      value={timberGrade}
                      onChange={(e) => setTimberGrade(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Grade A">Grade A (Heartwood dominant)</option>
                      <option value="Grade B">Grade B (Standard commercial)</option>
                      <option value="Grade C">Grade C (Mixed sapwood/utility)</option>
                    </select>
                  </div>

                  {/* Land Type */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Cultivation Land Type</label>
                    <select
                      value={landType}
                      onChange={(e) => setLandType(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Agriculture">Agriculture Farm</option>
                      <option value="Forest">Forest/Reserve Land</option>
                      <option value="Wasteland">Wasteland/Dry field</option>
                      <option value="Residential">Residential Yard</option>
                      <option value="Commercial">Commercial Plantation</option>
                    </select>
                  </div>

                  {/* Soil Type */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Soil Classification</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Alluvial">Alluvial (High fertility)</option>
                      <option value="Black">Black Cotton (Moisture retaining)</option>
                      <option value="Red">Red (Iron-rich/Good drainage)</option>
                      <option value="Laterite">Laterite (Acidic/Leached)</option>
                      <option value="Sandy">Sandy (Low retention)</option>
                      <option value="Clayey">Clayey (Compact/Heavy)</option>
                    </select>
                  </div>

                  {/* Rainfall Zone */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Rainfall / Climate Zone</label>
                    <select
                      value={rainfallZone}
                      onChange={(e) => setRainfallZone(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    >
                      <option value="Low">Low (&lt; 750 mm)</option>
                      <option value="Medium">Medium (750 - 1500 mm)</option>
                      <option value="High">High (1500 - 2500 mm)</option>
                      <option value="Heavy">Heavy (&gt; 2500 mm)</option>
                    </select>
                  </div>

                  {/* Drone support */}
                  <div className="space-y-1 flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="hasDroneImages"
                      checked={hasDroneImages}
                      onChange={(e) => setHasDroneImages(e.target.checked)}
                      className="rounded border-brand-clay text-brand-sage focus:ring-brand-sage w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="hasDroneImages" className="font-bold text-brand-earth dark:text-slate-400 cursor-pointer">Drone Verified Images</label>
                  </div>

                  {/* Video URL */}
                  <div className="space-y-1">
                    <label className="font-bold text-brand-earth dark:text-slate-400">Video Walkthrough URL</label>
                    <input
                      type="text"
                      placeholder="e.g. YouTube or Drive Link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-sage ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-white border-brand-clay text-brand-moss'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Indian Address Breakdown with Hierarchical Dropdowns */}
              <div className="p-4 rounded-2xl border space-y-4 bg-brand-sand/30 dark:bg-brand-darkgreen/10 border-brand-clay/60 dark:border-brand-darkborder">
                <h4 className="text-xs font-bold text-brand-moss dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-sage" /> Indian Plantation Location Hierarchy & Interactive Pin
                </h4>
                
                <IndiaLocationSelect
                  state={state}
                  district={district}
                  tehsil={tehsil}
                  village={village}
                  pincode={pincode}
                  onChange={(loc) => {
                    if (loc.state) setState(loc.state);
                    if (loc.district) setDistrict(loc.district);
                    if (loc.tehsil) setTehsil(loc.tehsil);
                    if (loc.village) setVillage(loc.village);
                    if (loc.pincode) setPincode(loc.pincode);
                  }}
                  darkMode={darkMode}
                />

                <div className="pt-2">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Pin Plantation GPS Location on Google Map
                  </label>
                  <LocationPickerMap
                    gpsLocation={gpsLocation}
                    state={state}
                    district={district}
                    onLocationSelect={(latLngStr) => setGpsLocation(latLngStr)}
                    darkMode={darkMode}
                  />
                  <p className="text-[10px] text-brand-earth mt-1 font-semibold">
                    Current Coordinates: <span className="text-brand-sage font-mono font-bold">{gpsLocation || 'Not Pinned'}</span>
                  </p>
                </div>
              </div>

              {/* Price & negotiations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Expected Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage ${
                      darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                    }`}
                  />
                </div>

                {/* Status checkboxes */}
                <div className="flex gap-6 items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-moss dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="rounded border-brand-clay text-brand-sage focus:ring-brand-sage w-4 h-4 cursor-pointer"
                    />
                    <span>Negotiable Price</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-moss dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={harvestReady}
                      onChange={(e) => setHarvestReady(e.target.checked)}
                      className="rounded border-brand-clay text-brand-sage focus:ring-brand-sage w-4 h-4 cursor-pointer"
                    />
                    <span>Ready for Harvest (Timber)</span>
                  </label>
                </div>
              </div>

              {/* Description textarea */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Description & Quality Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe your nursery tree assets or forest logs. E.g. heartwood density, felling passes, organic fertilizer logs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage resize-none ${
                    darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay text-brand-moss placeholder-brand-earth/50'
                  }`}
                />
              </div>

              {/* Upload block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider">Upload Tree Images *</label>
                  <span className="text-[10px] text-brand-earth dark:text-slate-400 font-bold">
                    {images.length}/10 uploaded
                  </span>
                </div>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? 'border-brand-sage bg-brand-sage/10 scale-[1.01]' 
                      : darkMode ? 'border-brand-darkborder bg-brand-darkgreen/40 hover:border-brand-sage/40' : 'border-brand-clay bg-brand-sand hover:border-brand-sage'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-2 py-2">
                      <RefreshCw className="w-8 h-8 mx-auto text-brand-sage animate-spin" />
                      <p className="text-xs font-semibold text-brand-moss dark:text-white">Uploading, compressing, and validating files...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-brand-earth mb-2" />
                      <p className="text-xs font-semibold">Drag & drop photos here, or <span className="text-brand-sage hover:underline">browse files</span></p>
                      <p className="text-[10px] text-brand-earth/75 mt-1">Supports PNG, JPG, JPEG, WEBP (Max 5 MB each. Up to 10 images)</p>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Uploaded Thumbnails with sorting controls */}
                {images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-brand-earth uppercase tracking-wider font-bold">Arrange Image Order (Drag/Move left/right. First is Cover Photo):</p>
                    <div className="flex flex-wrap gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-xl border border-brand-clay dark:border-brand-darkborder overflow-hidden group shadow-sm bg-brand-sand">
                          <img src={img} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow z-10 cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Cover badge / order number */}
                          <span className={`absolute top-1 left-1 font-mono text-[9px] px-1.5 py-0.5 rounded font-black z-10 shadow-sm ${
                            idx === 0 
                              ? 'bg-brand-moss text-white border border-brand-sage/20' 
                              : 'bg-black/60 text-white'
                          }`}>
                            {idx === 0 ? 'Cover' : idx + 1}
                          </span>

                          {/* Rearrange buttons */}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, idx - 1)}
                              className="text-white hover:text-brand-sage disabled:opacity-30 disabled:hover:text-white font-black text-xs cursor-pointer p-0.5 focus:outline-none"
                              title="Move Left"
                            >
                              ←
                            </button>
                            <span className="text-[8px] text-white font-bold tracking-wider uppercase">Position</span>
                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => moveImage(idx, idx + 1)}
                              className="text-white hover:text-brand-sage disabled:opacity-30 disabled:hover:text-white font-black text-xs cursor-pointer p-0.5 focus:outline-none"
                              title="Move Right"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-xs uppercase cursor-pointer focus:outline-none transition-colors ${
                    darkMode ? 'bg-brand-darkcard border-brand-darkborder hover:bg-brand-darkborder text-slate-200' : 'bg-brand-sand border-brand-clay hover:bg-brand-clay/15 text-brand-moss'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-moss hover:bg-brand-sage text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  {editingTree ? 'Save Changes' : 'Publish APMC Tree'}
                </button>
              </div>

            </div>

            {/* Arborist AI Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <div className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-brand-sand/35 border-brand-clay shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-moss rounded-lg text-white">
                    <Sparkles className="w-4.5 h-4.5 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm tracking-tight text-brand-moss dark:text-white">Arborist AI Assistant</h3>
                    <p className="text-[10px] text-brand-earth dark:text-slate-400">Listing copy & price optimizers</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-brand-earth dark:text-slate-400">
                  Analyze your tree specifications using TreeMarket AI. Get regional Indian market evaluations, suggested prices (INR), and legal care details instantly!
                </p>

                <button
                  type="button"
                  onClick={handleAIEstimation}
                  disabled={aiLoading}
                  className="w-full bg-brand-moss hover:bg-brand-sage disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Calibrating prices...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Calibrate with Arborist AI
                    </>
                  )}
                </button>

                {aiError && (
                  <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] leading-relaxed rounded-xl">
                    {aiError}
                  </div>
                )}

                {/* AI Outputs and quick apply buttons */}
                {aiResult && (
                  <div className="space-y-5 pt-4 border-t border-brand-clay dark:border-brand-darkborder text-xs leading-relaxed">
                    
                    {/* Key Arborist Metrics Badges */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/30 border-brand-darkborder' : 'bg-brand-sand border-brand-clay'}`}>
                        <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase tracking-wider font-bold">Timber Volume</p>
                        <p className="text-sm font-black text-brand-moss dark:text-brand-sage">
                          {aiResult.estimatedTimberVolume ? `${aiResult.estimatedTimberVolume.toFixed(2)} CFT` : 'N/A'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/30 border-brand-darkborder' : 'bg-brand-sand border-brand-clay'}`}>
                        <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase tracking-wider font-bold">Investment Grade</p>
                        <p className="text-sm font-black text-brand-moss dark:text-brand-sage">
                          {aiResult.investmentGrade || 'Grade B'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/30 border-brand-darkborder' : 'bg-brand-sand border-brand-clay'}`}>
                        <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase tracking-wider font-bold">Confidence Score</p>
                        <p className="text-sm font-black text-brand-moss dark:text-brand-sage">
                          {aiResult.confidenceScore ? `${aiResult.confidenceScore}%` : '85%'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-brand-darkgreen/30 border-brand-darkborder' : 'bg-brand-sand border-brand-clay'}`}>
                        <p className="text-[9px] text-brand-earth dark:text-slate-400 uppercase tracking-wider font-bold">CO₂ Sequestered</p>
                        <p className="text-sm font-black text-brand-moss dark:text-brand-sage">
                          {aiResult.carbonStorage ? `${Math.round(aiResult.carbonStorage)} kg` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Price with Apply Button */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-brand-sage/10 border border-brand-sage/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-moss dark:text-brand-sage uppercase tracking-wider text-[10px]">AI Suggested Price (Total Listing)</span>
                        <button
                          type="button"
                          onClick={applyAIPrice}
                          className="bg-brand-moss text-white px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider hover:bg-brand-sage transition-all cursor-pointer shadow-sm shadow-brand-moss/10"
                        >
                          Apply Price
                        </button>
                      </div>
                      <p className="text-lg font-black text-brand-moss dark:text-brand-sage">
                        {aiResult.suggestedSellingPrice 
                          ? `₹${aiResult.suggestedSellingPrice.toLocaleString('en-IN')}` 
                          : aiResult.suggestedPriceRange || 'N/A'}
                      </p>
                    </div>

                    {/* Trade Pricing Channels */}
                    <div className={`p-3 rounded-xl border space-y-2 ${darkMode ? 'bg-brand-darkgreen/10 border-brand-darkborder' : 'bg-brand-sand/40 border-brand-clay'}`}>
                      <p className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[9px]">Market Distribution Channels</p>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between border-b border-brand-clay/50 dark:border-brand-darkborder/50 pb-1">
                          <span className="text-brand-earth dark:text-slate-400">Wholesale (Mandi Bulk):</span>
                          <span className="font-bold text-brand-moss dark:text-white">
                            ₹{(aiResult.wholesalePrice || (aiResult.suggestedSellingPrice ? aiResult.suggestedSellingPrice * 0.85 : 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-brand-clay/50 dark:border-brand-darkborder/50 py-1">
                          <span className="text-brand-earth dark:text-slate-400">Retail / Direct Buyer:</span>
                          <span className="font-bold text-brand-moss dark:text-white">
                            ₹{(aiResult.retailPrice || (aiResult.suggestedSellingPrice ? aiResult.suggestedSellingPrice * 1.15 : 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-brand-earth dark:text-slate-400">Govt. Auction Estimate:</span>
                          <span className="font-bold text-brand-moss dark:text-white">
                            ₹{(aiResult.auctionValue || (aiResult.suggestedSellingPrice ? aiResult.suggestedSellingPrice * 0.95 : 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Future Growth Valuation */}
                    <div className={`p-3 rounded-xl border space-y-2 ${darkMode ? 'bg-brand-darkgreen/10 border-brand-darkborder' : 'bg-brand-sand/40 border-brand-clay'}`}>
                      <p className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[9px]">Future Projections (Compound Growth)</p>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between border-b border-brand-clay/50 dark:border-brand-darkborder/50 pb-1">
                          <span className="text-brand-earth dark:text-slate-400">In 1 Year:</span>
                          <span className="font-semibold text-brand-moss dark:text-brand-sage">
                            ₹{(aiResult.futurePrice1Year || (aiResult.suggestedSellingPrice ? aiResult.suggestedSellingPrice * 1.08 : 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-brand-clay/50 dark:border-brand-darkborder/50 py-1">
                          <span className="text-brand-earth dark:text-slate-400">In 3 Years:</span>
                          <span className="font-semibold text-brand-moss dark:text-brand-sage">
                            ₹{(aiResult.futurePrice3Years || (aiResult.suggestedSellingPrice ? aiResult.suggestedSellingPrice * 1.25 : 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-brand-earth dark:text-slate-400">In 5 Years:</span>
                          <span className="font-black text-brand-moss dark:text-brand-sage">
                            ₹{(aiResult.futurePrice5Years || (aiResult.suggestedSellingPrice ? aiResult.suggestedSellingPrice * 1.50 : 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Market Analysis */}
                    <div className="space-y-1">
                      <span className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[10px]">Mandi Demand Analysis</span>
                      <p className={`${darkMode ? 'text-slate-300' : 'text-brand-earth'} text-[11px]`}>{aiResult.marketAnalysis}</p>
                    </div>

                    {/* AI Copy */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[10px]">AI Sales Copy</span>
                        <button
                          type="button"
                          onClick={applyAIDescription}
                          className="text-brand-sage hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Apply Description
                        </button>
                      </div>
                      <p className={`p-2.5 rounded-xl border text-[11px] h-32 overflow-y-auto ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-300' : 'bg-brand-sand border-brand-clay text-brand-moss'
                      }`}>
                        {aiResult.professionalDescription}
                      </p>
                    </div>

                    {/* Care Guidelines */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-earth dark:text-slate-400 uppercase tracking-wider text-[10px]">Indian Cultivation Care</span>
                        <button
                          type="button"
                          onClick={appendAICareInstructions}
                          className="text-brand-sage hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Append to Listing
                        </button>
                      </div>
                      <p className={`p-2.5 rounded-xl border text-[11px] whitespace-pre-line ${
                        darkMode ? 'bg-brand-darkgreen border-brand-darkborder text-slate-300' : 'bg-brand-sand border-brand-clay text-brand-moss'
                      }`}>
                        {aiResult.careInstructions}
                      </p>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </form>
        </div>
      ) : (
        <>
          {/* Active Tab: Listings Grid */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">Active APMC Listings ({listings.length})</h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-4 border-brand-moss border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-brand-earth font-semibold">Loading your agricultural assets...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border flex flex-col items-center justify-center space-y-3 ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-brand-sand/35 border-brand-clay'
                }`}>
                  <Trees className="w-10 h-10 text-brand-sage" />
                  <h3 className="font-serif font-bold text-base text-brand-moss dark:text-white">No listings registered</h3>
                  <p className="text-sm text-brand-earth max-w-sm">You haven't listed any trees for trade. Click 'Add Tree Listing' to publish nursery stocks or mature timber!</p>
                  <button 
                    onClick={handleOpenAddForm}
                    className="bg-brand-moss hover:bg-brand-sage text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer"
                  >
                    List Your First Tree Stock
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((tree) => {
                    const treePrice = tree.expectedPrice || tree.price || 0;
                    return (
                      <div
                        key={tree.id}
                        className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                          darkMode ? 'bg-brand-darkcard border-brand-darkborder hover:border-brand-sage/40 hover:shadow-xl' : 'bg-white border-brand-clay hover:border-brand-sage hover:shadow-xl'
                        }`}
                      >
                        <div>
                          <div className="relative h-44 overflow-hidden bg-brand-sand">
                            <img src={tree.images[0] || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop'} alt={tree.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute top-3 left-3 bg-brand-moss/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border border-white/10">
                              {tree.category}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-brand-moss text-white font-bold px-3 py-1 rounded-lg text-sm border border-brand-clay/10">
                              ₹{treePrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-serif font-bold text-sm tracking-tight truncate text-brand-moss dark:text-white">{tree.name}</h3>
                            {tree.localName && <p className="text-[11px] font-bold text-brand-sage font-serif">Local: {tree.localName}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-brand-earth dark:text-slate-400 font-medium">
                              <span>Age: {tree.age} yrs</span>
                              <span>Height: {tree.height}ft</span>
                              <span>Qty: {tree.quantity} units</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <div className="flex items-center justify-between pt-3 border-t border-brand-clay dark:border-brand-darkborder">
                            <button
                              onClick={() => setView('details', { id: tree.id })}
                              className="text-xs font-bold text-brand-sage hover:text-brand-moss hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenEditForm(tree)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  darkMode ? 'bg-brand-darkcard hover:bg-brand-darkborder border-brand-darkborder text-slate-300' : 'bg-brand-sand hover:bg-brand-clay/15 border-brand-clay text-brand-moss'
                                }`}
                                title="Edit Listing"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(tree.id)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  darkMode ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-500' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                                }`}
                                title="Delete Listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Received Trade Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">Buyer Purchasing Requests</h2>

              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-brand-sage" />
                </div>
              ) : orders.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay'
                }`}>
                  <ClipboardList className="w-10 h-10 mx-auto text-brand-earth mb-2" />
                  <p className="text-sm text-brand-earth">No orders placed for your wood assets yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className={`p-6 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${
                        darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-brand-sage/20 text-brand-sage text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded">
                            {ord.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
                          </span>
                          <span className="text-xs text-brand-earth font-semibold">{ord.id}</span>
                        </div>
                        
                        <h3 className="font-serif font-bold text-lg text-brand-moss dark:text-white">
                          Order: {ord.treeName} <span className="text-brand-sage">({ord.quantity} units)</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-brand-earth font-medium">
                          <p>Buyer: <strong>{ord.buyerName}</strong> ({ord.buyerContact})</p>
                          <p>Payment Mode: <strong>{ord.paymentMethod.toUpperCase()}</strong></p>
                          <p className="col-span-2">
                            Transit Destination: {ord.deliveryAddress.village}, {ord.deliveryAddress.tehsil}, {ord.deliveryAddress.district}, {ord.deliveryAddress.state} ({ord.deliveryAddress.pincode})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 justify-between">
                        <div className="text-right">
                          <p className="text-[10px] text-brand-earth uppercase font-bold tracking-wider">Gross Trade Volume</p>
                          <p className="text-2xl font-black text-brand-moss dark:text-brand-sage">₹{ord.totalAmount.toLocaleString('en-IN')}</p>
                        </div>

                        {/* Order Management Actions (Fulfill, Accept, Reject) */}
                        <div className="flex gap-2">
                          {ord.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'accepted')}
                                className="bg-brand-moss hover:bg-brand-sage text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Accept Order
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'rejected')}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}

                          {ord.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Dispatched
                            </button>
                          )}

                          {ord.status === 'completed' && (
                            <span className="bg-emerald-600/10 text-emerald-600 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl border border-emerald-500/20">
                              Order Completed
                            </span>
                          )}

                          {ord.status === 'rejected' && (
                            <span className="bg-rose-600/10 text-rose-500 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl border border-rose-500/20">
                              Order Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Earnings & Volume Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-serif font-bold tracking-tight text-brand-moss dark:text-white">APMC Trade & Revenue Reports</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className={`p-6 rounded-2xl border space-y-2 ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
                }`}>
                  <p className="text-[10px] font-black text-brand-earth uppercase tracking-widest">Gross Revenue (₹)</p>
                  <p className="text-3xl font-black text-brand-sage">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>

                <div className={`p-6 rounded-2xl border space-y-2 ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
                }`}>
                  <p className="text-[10px] font-black text-brand-earth uppercase tracking-widest">Completed Trades</p>
                  <p className="text-3xl font-black text-brand-moss dark:text-white">{completedOrders.length}</p>
                </div>

                <div className={`p-6 rounded-2xl border space-y-2 ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
                }`}>
                  <p className="text-[10px] font-black text-brand-earth uppercase tracking-widest">Pending Dispatches</p>
                  <p className="text-3xl font-black text-amber-500">{acceptedOrders.length}</p>
                </div>

                <div className={`p-6 rounded-2xl border space-y-2 ${
                  darkMode ? 'bg-brand-darkcard border-brand-darkborder' : 'bg-white border-brand-clay shadow-sm'
                }`}>
                  <p className="text-[10px] font-black text-brand-earth uppercase tracking-widest">Incoming Orders</p>
                  <p className="text-3xl font-black text-blue-500">{pendingOrders.length}</p>
                </div>
              </div>

              {/* APMC Timber Transit pass notification help box */}
              <div className="p-6 bg-brand-sand/50 dark:bg-brand-darkgreen/20 rounded-2xl border border-brand-clay/60 space-y-3">
                <h4 className="font-serif font-bold text-sm text-brand-moss dark:text-white flex items-center gap-1.5">
                  <Info className="w-5 h-5 text-brand-sage" /> Indian Timber Transit Pass (TP) Compliance Helper
                </h4>
                <p className="text-xs text-brand-earth leading-relaxed">
                  Under the National Transit Pass System (NTPS), moving timber species like Sandalwood, Rosewood, and Teak across state boundaries requires transit passes. Our system auto-completes district-level geolocations, GPS parameters, and APMC receipts to accelerate compliance check approvals.
                </p>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

// Inline Info icon placeholder matching other lucide elements
function Info(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
