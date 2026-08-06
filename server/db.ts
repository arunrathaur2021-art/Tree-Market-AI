import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- Types & Interfaces for Indian Tree Market ---

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'buyer' | 'seller' | 'admin';
  contactNumber?: string;
  location?: string;
  fullAddress?: string;
  houseNo?: string;
  street?: string;
  landmark?: string;
  village?: string;
  taluka?: string;
  state?: string;
  district?: string;
  pincode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  isOnline?: boolean;
  lastSeen?: string;
  blockedUserIds?: string[];
  archivedChatPartnerIds?: string[];
}

export interface Tree {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  name: string;
  localName: string;
  scientificName: string;
  category: string;
  species?: string;
  age: number; // in years
  height: number; // in feet
  diameter: number; // in inches
  quantity: number;
  expectedPrice: number; // Price in INR (₹)
  negotiable: boolean;
  harvestReady: boolean;
  description: string;
  images: string[];
  videos: string[];
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;
  gpsLocation: string; // "lat, lng"
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;

  // Extra Arborist Fields
  trunkCircumference?: number;
  healthCondition?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  growthRate?: 'Slow' | 'Moderate' | 'Fast';
  trunkStraightness?: 'Very Straight' | 'Slightly Curved' | 'Crooked';
  woodDensity?: 'High' | 'Medium' | 'Low';
  moistureLevel?: 'Dry' | 'Semi-dry' | 'Fresh/Green';
  timberGrade?: 'Grade A' | 'Grade B' | 'Grade C';
  landType?: 'Agriculture' | 'Forest' | 'Wasteland' | 'Residential' | 'Commercial';
  soilType?: 'Alluvial' | 'Black' | 'Red' | 'Laterite' | 'Sandy' | 'Clayey';
  rainfallZone?: 'Low' | 'Medium' | 'High' | 'Heavy';
  hasDroneImages?: boolean;
  videoUrl?: string;

  // AI Estimation Output
  aiEstimation?: any;
}

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  basePricePerCft: number;
  maturityAgeYears: number;
  woodDensityGcm3: number;
  carbonStorageFactor: number;
}

export interface TimberMarketPrice {
  id: string;
  speciesId: string;
  speciesName: string;
  state: string;
  mandiPricePerCft: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  lastUpdated: string;
}

export interface Order {
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

export interface Payment {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  paymentMethod: 'upi' | 'phonepe' | 'gpay' | 'paytm' | 'razorpay';
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface Review {
  id: string;
  treeId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  treeId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  treeId: string;
  treeName: string;
  content: string;
  messageType?: 'text' | 'image' | 'document' | 'location' | 'offer';
  mediaUrl?: string;
  mediaName?: string;
  locationData?: { lat: number; lng: number; address: string };
  offerData?: { offerPrice: number; status: 'pending' | 'accepted' | 'rejected' };
  isRead?: boolean;
  deletedFor?: string[];
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  speciesName: string;
  region: string; // state name or "All India"
  targetPrice: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'price_alert' | 'general' | 'order' | 'message' | 'offer' | 'approval';
  isRead: boolean;
  createdAt: string;
}

export interface DBStructure {
  users: User[];
  trees: Tree[];
  orders: Order[];
  payments: Payment[];
  reviews: Review[];
  wishlist: Wishlist[];
  messages: Message[];
  reports?: UserReport[];
  priceAlerts?: PriceAlert[];
  notifications?: Notification[];
  speciesDatabase?: Species[];
  timberMarketPrices?: TimberMarketPrice[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');

// Standard Helper for password hashing (SHA-256)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Seed Users for Indian TreeMarket AI
const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'Rajesh Kumar (Admin)',
    email: 'admin@treemarket.in',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    contactNumber: '+91 9876543210',
    state: 'Delhi',
    district: 'New Delhi',
    pincode: '110001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_seller_1',
    name: 'Karan Singh (Nursery Owner)',
    email: 'karan@greenwood.in',
    passwordHash: hashPassword('seller123'),
    role: 'seller',
    contactNumber: '+91 8765432109',
    state: 'Karnataka',
    district: 'Mysuru',
    pincode: '570001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_seller_2',
    name: 'Baldev Singh (Farmer)',
    email: 'baldev@punjabfarms.in',
    passwordHash: hashPassword('seller123'),
    role: 'seller',
    contactNumber: '+91 7654321098',
    state: 'Punjab',
    district: 'Ludhiana',
    pincode: '141001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_buyer_1',
    name: 'Aravind Swamy',
    email: 'aravind@buyer.in',
    passwordHash: hashPassword('buyer123'),
    role: 'buyer',
    contactNumber: '+91 9988776655',
    state: 'Tamil Nadu',
    district: 'Chennai',
    pincode: '600001',
    createdAt: new Date().toISOString(),
  }
];

// Seed Trees (India Categories & States)
const INITIAL_TREES: Tree[] = [
  {
    id: 'tree_1',
    sellerId: 'user_seller_1',
    sellerName: 'Karan Singh (Nursery Owner)',
    sellerContact: '+91 8765432109',
    name: 'Premium Mysore Sandalwood Trees',
    localName: 'Chandan',
    scientificName: 'Santalum album',
    category: 'Sandalwood',
    age: 12,
    height: 18,
    diameter: 6.5,
    quantity: 15,
    expectedPrice: 45000,
    negotiable: true,
    harvestReady: false,
    description: 'High-quality authentic Mysore Sandalwood trees with high oil-content heartwood. Cultivated legally with State Forest Department registrations. Excellent investment tree.',
    images: [
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop'
    ],
    videos: [],
    state: 'Karnataka',
    district: 'Mysuru',
    tehsil: 'Hunsur',
    village: 'Bilimale',
    pincode: '571105',
    gpsLocation: '12.3106, 76.6433',
    status: 'approved',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tree_2',
    sellerId: 'user_seller_2',
    sellerName: 'Baldev Singh (Farmer)',
    sellerContact: '+91 7654321098',
    name: 'Mature Indian Teak Wood Trees',
    localName: 'Sagwan',
    scientificName: 'Tectona grandis',
    category: 'Teak',
    age: 18,
    height: 45,
    diameter: 15.0,
    quantity: 120,
    expectedPrice: 18000,
    negotiable: true,
    harvestReady: true,
    description: 'Fully matured high-density Punjab Sagwan (Teak) trees. Beautiful straight logs, prime timber grade, perfectly legal and transit pass (TP) support will be provided.',
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format&fit=crop'
    ],
    videos: [],
    state: 'Punjab',
    district: 'Ludhiana',
    tehsil: 'Samrala',
    village: 'Mushkabad',
    pincode: '141114',
    gpsLocation: '30.9010, 75.8573',
    status: 'approved',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tree_3',
    sellerId: 'user_seller_1',
    sellerName: 'Karan Singh (Nursery Owner)',
    sellerContact: '+91 8765432109',
    name: 'Organic Alphonso Mango Tree Orchard',
    localName: 'Hapus Aam',
    scientificName: 'Mangifera indica',
    category: 'Mango',
    age: 8,
    height: 15,
    diameter: 8.0,
    quantity: 40,
    expectedPrice: 12000,
    negotiable: false,
    harvestReady: false,
    description: 'High-yield grafted Hapus (Alphonso) mango trees. Currently fruiting and in excellent health. Perfect for setting up an immediate organic orchard.',
    images: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop'
    ],
    videos: [],
    state: 'Maharashtra',
    district: 'Ratnagiri',
    tehsil: 'Sangameshwar',
    village: 'Devrukh',
    pincode: '415804',
    gpsLocation: '16.9902, 73.3120',
    status: 'approved',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tree_4',
    sellerId: 'user_seller_2',
    sellerName: 'Baldev Singh (Farmer)',
    sellerContact: '+91 7654321098',
    name: 'Medicinal Neem Trees Commercial Grade',
    localName: 'Neem',
    scientificName: 'Azadirachta indica',
    category: 'Neem',
    age: 10,
    height: 25,
    diameter: 9.2,
    quantity: 60,
    expectedPrice: 7500,
    negotiable: true,
    harvestReady: true,
    description: 'Sturdy Neem trees rich in medicinal values. Bark, twigs, and leaves are fully organic. Ready for harvest for timber or pharmaceutical applications.',
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop'
    ],
    videos: [],
    state: 'Uttar Pradesh',
    district: 'Bareilly',
    tehsil: 'Aonla',
    village: 'Sirauli',
    pincode: '243303',
    gpsLocation: '28.3636, 79.4316',
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tree_5',
    sellerId: 'user_seller_1',
    sellerName: 'Karan Singh (Nursery Owner)',
    sellerContact: '+91 8765432109',
    name: 'Premium Shisham Wood Trees',
    localName: 'Shisham / Rosewood',
    scientificName: 'Dalbergia sissoo',
    category: 'Shisham',
    age: 14,
    height: 38,
    diameter: 12.0,
    quantity: 30,
    expectedPrice: 15000,
    negotiable: true,
    harvestReady: true,
    description: 'High-density North Indian Rosewood (Shisham). Renowned for crafting luxury hardwood furniture. Pest-resistant trunks with beautiful natural grains.',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop'
    ],
    videos: [],
    state: 'Haryana',
    district: 'Ambala',
    tehsil: 'Naraingarh',
    village: 'Kardhan',
    pincode: '134003',
    gpsLocation: '30.3782, 76.7767',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_SPECIES: Species[] = [
  { id: 'sp_1', name: 'Teak (Sagwan)', scientificName: 'Tectona grandis', category: 'Teak (Sagwan)', basePricePerCft: 2200, maturityAgeYears: 20, woodDensityGcm3: 0.65, carbonStorageFactor: 0.45 },
  { id: 'sp_2', name: 'Sandalwood', scientificName: 'Santalum album', category: 'Sandalwood', basePricePerCft: 12000, maturityAgeYears: 15, woodDensityGcm3: 0.90, carbonStorageFactor: 0.52 },
  { id: 'sp_3', name: 'Shisham', scientificName: 'Dalbergia sissoo', category: 'Shisham', basePricePerCft: 1500, maturityAgeYears: 12, woodDensityGcm3: 0.78, carbonStorageFactor: 0.48 },
  { id: 'sp_4', name: 'Eucalyptus', scientificName: 'Eucalyptus globulus', category: 'Eucalyptus', basePricePerCft: 450, maturityAgeYears: 7, woodDensityGcm3: 0.55, carbonStorageFactor: 0.42 },
  { id: 'sp_5', name: 'Bamboo', scientificName: 'Bambusa vulgaris', category: 'Bamboo', basePricePerCft: 250, maturityAgeYears: 4, woodDensityGcm3: 0.40, carbonStorageFactor: 0.35 },
  { id: 'sp_6', name: 'Mango', scientificName: 'Mangifera indica', category: 'Mango', basePricePerCft: 600, maturityAgeYears: 10, woodDensityGcm3: 0.60, carbonStorageFactor: 0.44 },
  { id: 'sp_7', name: 'Mahogany', scientificName: 'Swietenia mahagoni', category: 'Mahogany', basePricePerCft: 1300, maturityAgeYears: 15, woodDensityGcm3: 0.70, carbonStorageFactor: 0.47 },
  { id: 'sp_8', name: 'Rosewood', scientificName: 'Dalbergia latifolia', category: 'Rosewood', basePricePerCft: 3200, maturityAgeYears: 25, woodDensityGcm3: 0.82, carbonStorageFactor: 0.50 },
  { id: 'sp_9', name: 'Poplar', scientificName: 'Populus deltoides', category: 'Poplar', basePricePerCft: 400, maturityAgeYears: 6, woodDensityGcm3: 0.45, carbonStorageFactor: 0.38 },
  { id: 'sp_10', name: 'Neem', scientificName: 'Azadirachta indica', category: 'Neem', basePricePerCft: 800, maturityAgeYears: 10, woodDensityGcm3: 0.68, carbonStorageFactor: 0.46 }
];

const INITIAL_TIMBER_PRICES: TimberMarketPrice[] = [
  { id: 'tmp_1', speciesId: 'sp_1', speciesName: 'Teak (Sagwan)', state: 'Karnataka', mandiPricePerCft: 2350, demandLevel: 'High', lastUpdated: '2026-03-10' },
  { id: 'tmp_2', speciesId: 'sp_1', speciesName: 'Teak (Sagwan)', state: 'Maharashtra', mandiPricePerCft: 2400, demandLevel: 'High', lastUpdated: '2026-03-10' },
  { id: 'tmp_3', speciesId: 'sp_2', speciesName: 'Sandalwood', state: 'Karnataka', mandiPricePerCft: 12500, demandLevel: 'High', lastUpdated: '2026-03-10' },
  { id: 'tmp_4', speciesId: 'sp_3', speciesName: 'Shisham', state: 'Punjab', mandiPricePerCft: 1650, demandLevel: 'Medium', lastUpdated: '2026-03-10' },
  { id: 'tmp_5', speciesId: 'sp_4', speciesName: 'Eucalyptus', state: 'Haryana', mandiPricePerCft: 480, demandLevel: 'Medium', lastUpdated: '2026-03-10' },
  { id: 'tmp_6', speciesId: 'sp_5', speciesName: 'Bamboo', state: 'Assam', mandiPricePerCft: 260, demandLevel: 'High', lastUpdated: '2026-03-10' },
  { id: 'tmp_7', speciesId: 'sp_6', speciesName: 'Mango', state: 'Uttar Pradesh', mandiPricePerCft: 650, demandLevel: 'Medium', lastUpdated: '2026-03-10' },
  { id: 'tmp_8', speciesId: 'sp_10', speciesName: 'Neem', state: 'Gujarat', mandiPricePerCft: 850, demandLevel: 'Medium', lastUpdated: '2026-03-10' }
];

class Database {
  private data: DBStructure = {
    users: [],
    trees: [],
    orders: [],
    payments: [],
    reviews: [],
    wishlist: [],
    messages: [],
    speciesDatabase: [],
    timberMarketPrices: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure schemas are present
        if (!this.data.users) this.data.users = [];
        if (!this.data.trees) this.data.trees = [];
        if (!this.data.orders) this.data.orders = [];
        if (!this.data.payments) this.data.payments = [];
        if (!this.data.reviews) this.data.reviews = [];
        if (!this.data.wishlist) this.data.wishlist = [];
        if (!this.data.messages) this.data.messages = [];
        if (!this.data.priceAlerts) this.data.priceAlerts = [];
        if (!this.data.notifications) this.data.notifications = [];
        if (!this.data.speciesDatabase) this.data.speciesDatabase = INITIAL_SPECIES;
        if (!this.data.timberMarketPrices) this.data.timberMarketPrices = INITIAL_TIMBER_PRICES;
      } else {
        this.data = {
          users: INITIAL_USERS,
          trees: INITIAL_TREES,
          orders: [],
          payments: [],
          reviews: [],
          wishlist: [],
          messages: [],
          priceAlerts: [],
          notifications: [],
          speciesDatabase: INITIAL_SPECIES,
          timberMarketPrices: INITIAL_TIMBER_PRICES
        };
        this.save();
      }
    } catch (err) {
      console.error('Error loading database:', err);
      this.data = {
        users: INITIAL_USERS,
        trees: INITIAL_TREES,
        orders: [],
        payments: [],
        reviews: [],
        wishlist: [],
        messages: [],
        priceAlerts: [],
        notifications: [],
        speciesDatabase: INITIAL_SPECIES,
        timberMarketPrices: INITIAL_TIMBER_PRICES
      };
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // --- Collection Models (Simulated Mongoose CRUD style) ---

  public get Users() {
    return {
      find: async (filter?: any) => {
        let list = this.data.users;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      findOne: async (filter: any) => {
        return this.data.users.find((item: any) => {
          return Object.keys(filter).every(key => {
            if (typeof filter[key] === 'string' && typeof item[key] === 'string') {
              return item[key].toLowerCase() === filter[key].toLowerCase();
            }
            return item[key] === filter[key];
          });
        }) || null;
      },
      findById: async (id: string) => {
        return this.data.users.find(u => u.id === id) || null;
      },
      create: async (userData: any) => {
        const newUser: User = {
          id: userData.id || 'user_' + crypto.randomUUID(),
          name: userData.name,
          email: userData.email.toLowerCase().trim(),
          passwordHash: userData.passwordHash,
          role: userData.role,
          contactNumber: userData.contactNumber,
          location: userData.location,
          state: userData.state,
          district: userData.district,
          pincode: userData.pincode,
          createdAt: new Date().toISOString()
        };
        this.data.users.push(newUser);
        this.save();
        return newUser;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        const index = this.data.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.data.users[index] = { ...this.data.users[index], ...update };
          this.save();
          return this.data.users[index];
        }
        return null;
      },
      findByIdAndDelete: async (id: string) => {
        const found = this.data.users.some(u => u.id === id);
        this.data.users = this.data.users.filter(u => u.id !== id);
        this.data.trees = this.data.trees.filter(t => t.sellerId !== id);
        this.data.orders = this.data.orders.filter(o => o.buyerId !== id && o.sellerId !== id);
        this.data.wishlist = this.data.wishlist.filter(w => w.userId !== id);
        this.save();
        return found;
      }
    };
  }

  public get Trees() {
    return {
      find: async (filter?: any) => {
        let list = this.data.trees;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => {
              if (filter[key] && typeof filter[key] === 'object') {
                // simple operator checks if needed, else exact match
                return true;
              }
              return item[key] === filter[key];
            });
          });
        }
        return list;
      },
      findOne: async (filter: any) => {
        return this.data.trees.find((item: any) => {
          return Object.keys(filter).every(key => item[key] === filter[key]);
        }) || null;
      },
      findById: async (id: string) => {
        return this.data.trees.find(t => t.id === id) || null;
      },
      create: async (treeData: any) => {
        const newTree: Tree = {
          id: 'tree_' + crypto.randomUUID(),
          sellerId: treeData.sellerId,
          sellerName: treeData.sellerName,
          sellerContact: treeData.sellerContact,
          name: treeData.name,
          localName: treeData.localName || "",
          scientificName: treeData.scientificName || "",
          category: treeData.category || "Teak",
          species: treeData.species || treeData.scientificName || treeData.category || "Teak",
          age: Number(treeData.age),
          height: Number(treeData.height),
          diameter: Number(treeData.diameter),
          quantity: Number(treeData.quantity),
          expectedPrice: Number(treeData.expectedPrice),
          negotiable: !!treeData.negotiable,
          harvestReady: !!treeData.harvestReady,
          description: treeData.description,
          images: Array.isArray(treeData.images) && treeData.images.length > 0 ? treeData.images : ["https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop"],
          videos: Array.isArray(treeData.videos) ? treeData.videos : [],
          state: treeData.state,
          district: treeData.district,
          tehsil: treeData.tehsil || "",
          village: treeData.village || "",
          pincode: treeData.pincode,
          gpsLocation: treeData.gpsLocation || "",
          status: treeData.status || 'pending',
          createdAt: new Date().toISOString(),

          // Extra fields
          trunkCircumference: treeData.trunkCircumference ? Number(treeData.trunkCircumference) : undefined,
          healthCondition: treeData.healthCondition,
          growthRate: treeData.growthRate,
          trunkStraightness: treeData.trunkStraightness,
          woodDensity: treeData.woodDensity,
          moistureLevel: treeData.moistureLevel,
          timberGrade: treeData.timberGrade,
          landType: treeData.landType,
          soilType: treeData.soilType,
          rainfallZone: treeData.rainfallZone,
          hasDroneImages: !!treeData.hasDroneImages,
          videoUrl: treeData.videoUrl,
          aiEstimation: treeData.aiEstimation
        };
        this.data.trees.push(newTree);
        this.save();
        return newTree;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        const index = this.data.trees.findIndex(t => t.id === id);
        if (index !== -1) {
          this.data.trees[index] = { ...this.data.trees[index], ...update };
          this.save();
          return this.data.trees[index];
        }
        return null;
      },
      findByIdAndDelete: async (id: string) => {
        const found = this.data.trees.some(t => t.id === id);
        this.data.trees = this.data.trees.filter(t => t.id !== id);
        this.data.wishlist = this.data.wishlist.filter(w => w.treeId !== id);
        this.save();
        return found;
      }
    };
  }

  public get Species() {
    return {
      find: async (filter?: any) => {
        let list = this.data.speciesDatabase || [];
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      findById: async (id: string) => {
        return (this.data.speciesDatabase || []).find(s => s.id === id) || null;
      },
      create: async (speciesData: any) => {
        if (!this.data.speciesDatabase) this.data.speciesDatabase = [];
        const newSpecies: Species = {
          id: 'sp_' + crypto.randomUUID(),
          name: speciesData.name,
          scientificName: speciesData.scientificName || '',
          category: speciesData.category || '',
          basePricePerCft: Number(speciesData.basePricePerCft) || 500,
          maturityAgeYears: Number(speciesData.maturityAgeYears) || 10,
          woodDensityGcm3: Number(speciesData.woodDensityGcm3) || 0.6,
          carbonStorageFactor: Number(speciesData.carbonStorageFactor) || 0.45
        };
        this.data.speciesDatabase.push(newSpecies);
        this.save();
        return newSpecies;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        if (!this.data.speciesDatabase) this.data.speciesDatabase = [];
        const index = this.data.speciesDatabase.findIndex(s => s.id === id);
        if (index !== -1) {
          this.data.speciesDatabase[index] = { ...this.data.speciesDatabase[index], ...update };
          this.save();
          return this.data.speciesDatabase[index];
        }
        return null;
      },
      findByIdAndDelete: async (id: string) => {
        if (!this.data.speciesDatabase) return false;
        const found = this.data.speciesDatabase.some(s => s.id === id);
        this.data.speciesDatabase = this.data.speciesDatabase.filter(s => s.id !== id);
        this.save();
        return found;
      }
    };
  }

  public get TimberMarketPrices() {
    return {
      find: async (filter?: any) => {
        let list = this.data.timberMarketPrices || [];
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      findById: async (id: string) => {
        return (this.data.timberMarketPrices || []).find(t => t.id === id) || null;
      },
      create: async (priceData: any) => {
        if (!this.data.timberMarketPrices) this.data.timberMarketPrices = [];
        const newPrice: TimberMarketPrice = {
          id: 'tmp_' + crypto.randomUUID(),
          speciesId: priceData.speciesId || '',
          speciesName: priceData.speciesName || '',
          state: priceData.state || 'Karnataka',
          mandiPricePerCft: Number(priceData.mandiPricePerCft) || 500,
          demandLevel: priceData.demandLevel || 'Medium',
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        this.data.timberMarketPrices.push(newPrice);
        this.save();
        return newPrice;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        if (!this.data.timberMarketPrices) this.data.timberMarketPrices = [];
        const index = this.data.timberMarketPrices.findIndex(t => t.id === id);
        if (index !== -1) {
          this.data.timberMarketPrices[index] = { ...this.data.timberMarketPrices[index], ...update, lastUpdated: new Date().toISOString().split('T')[0] };
          this.save();
          return this.data.timberMarketPrices[index];
        }
        return null;
      },
      findByIdAndDelete: async (id: string) => {
        if (!this.data.timberMarketPrices) return false;
        const found = this.data.timberMarketPrices.some(t => t.id === id);
        this.data.timberMarketPrices = this.data.timberMarketPrices.filter(t => t.id !== id);
        this.save();
        return found;
      }
    };
  }

  public get Orders() {
    return {
      find: async (filter?: any) => {
        let list = this.data.orders;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      findById: async (id: string) => {
        return this.data.orders.find(o => o.id === id) || null;
      },
      create: async (orderData: any) => {
        const newOrder: Order = {
          id: 'order_' + crypto.randomUUID(),
          buyerId: orderData.buyerId,
          buyerName: orderData.buyerName,
          buyerContact: orderData.buyerContact,
          sellerId: orderData.sellerId,
          sellerName: orderData.sellerName,
          sellerContact: orderData.sellerContact,
          treeId: orderData.treeId,
          treeName: orderData.treeName,
          pricePerTree: Number(orderData.pricePerTree),
          quantity: Number(orderData.quantity),
          totalAmount: Number(orderData.totalAmount),
          status: orderData.status || 'pending',
          paymentStatus: orderData.paymentStatus || 'pending',
          paymentMethod: orderData.paymentMethod,
          deliveryAddress: {
            state: orderData.deliveryAddress.state,
            district: orderData.deliveryAddress.district,
            tehsil: orderData.deliveryAddress.tehsil || "",
            village: orderData.deliveryAddress.village || "",
            pincode: orderData.deliveryAddress.pincode
          },
          createdAt: new Date().toISOString()
        };
        this.data.orders.push(newOrder);
        this.save();
        return newOrder;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        const index = this.data.orders.findIndex(o => o.id === id);
        if (index !== -1) {
          this.data.orders[index] = { ...this.data.orders[index], ...update };
          this.save();
          return this.data.orders[index];
        }
        return null;
      }
    };
  }

  public get Payments() {
    return {
      find: async (filter?: any) => {
        let list = this.data.payments;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      create: async (payData: any) => {
        const newPay: Payment = {
          id: 'pay_' + crypto.randomUUID(),
          orderId: payData.orderId,
          buyerId: payData.buyerId,
          sellerId: payData.sellerId,
          amount: payData.amount,
          paymentMethod: payData.paymentMethod,
          transactionId: payData.transactionId || 'tx_' + crypto.randomBytes(8).toString('hex'),
          status: payData.status || 'success',
          createdAt: new Date().toISOString()
        };
        this.data.payments.push(newPay);
        this.save();
        return newPay;
      }
    };
  }

  public get Reviews() {
    return {
      find: async (filter?: any) => {
        let list = this.data.reviews;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      create: async (revData: any) => {
        const newReview: Review = {
          id: 'rev_' + crypto.randomUUID(),
          treeId: revData.treeId,
          reviewerId: revData.reviewerId,
          reviewerName: revData.reviewerName,
          rating: Number(revData.rating),
          comment: revData.comment,
          createdAt: new Date().toISOString()
        };
        this.data.reviews.push(newReview);
        this.save();
        return newReview;
      }
    };
  }

  public get Wishlist() {
    return {
      find: async (filter?: any) => {
        let list = this.data.wishlist;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      create: async (wishData: any) => {
        const exists = this.data.wishlist.find(w => w.userId === wishData.userId && w.treeId === wishData.treeId);
        if (exists) return exists;

        const newWish: Wishlist = {
          id: 'wish_' + crypto.randomUUID(),
          userId: wishData.userId,
          treeId: wishData.treeId,
          createdAt: new Date().toISOString()
        };
        this.data.wishlist.push(newWish);
        this.save();
        return newWish;
      },
      deleteOne: async (filter: any) => {
        const initialLen = this.data.wishlist.length;
        this.data.wishlist = this.data.wishlist.filter((item: any) => {
          return !Object.keys(filter).every(key => item[key] === filter[key]);
        });
        this.save();
        return this.data.wishlist.length < initialLen;
      }
    };
  }

  public get Messages() {
    return {
      find: async (filter?: any) => {
        let list = this.data.messages;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => {
              if (key === '$or') {
                const orArray = filter[key];
                return orArray.some((subFilter: any) => {
                  return Object.keys(subFilter).every(subKey => item[subKey] === subFilter[subKey]);
                });
              }
              return item[key] === filter[key];
            });
          });
        }
        return list;
      },
      findById: async (id: string) => {
        return this.data.messages.find(m => m.id === id) || null;
      },
      create: async (msgData: any) => {
        const newMsg: Message = {
          id: 'msg_' + crypto.randomUUID(),
          senderId: msgData.senderId,
          receiverId: msgData.receiverId,
          treeId: msgData.treeId || "",
          treeName: msgData.treeName || "",
          content: msgData.content || "",
          messageType: msgData.messageType || 'text',
          mediaUrl: msgData.mediaUrl || undefined,
          mediaName: msgData.mediaName || undefined,
          locationData: msgData.locationData || undefined,
          offerData: msgData.offerData || undefined,
          isRead: false,
          deletedFor: [],
          createdAt: new Date().toISOString()
        };
        this.data.messages.push(newMsg);
        this.save();
        return newMsg;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        const index = this.data.messages.findIndex(m => m.id === id);
        if (index !== -1) {
          this.data.messages[index] = { ...this.data.messages[index], ...update };
          this.save();
          return this.data.messages[index];
        }
        return null;
      },
      deleteForUser: async (messageId: string, userId: string) => {
        const msg = this.data.messages.find(m => m.id === messageId);
        if (msg) {
          if (!msg.deletedFor) msg.deletedFor = [];
          if (!msg.deletedFor.includes(userId)) {
            msg.deletedFor.push(userId);
            this.save();
          }
          return true;
        }
        return false;
      },
      markConversationAsRead: async (myUserId: string, partnerId: string) => {
        let updatedCount = 0;
        this.data.messages.forEach(m => {
          if (m.senderId === partnerId && m.receiverId === myUserId && !m.isRead) {
            m.isRead = true;
            updatedCount++;
          }
        });
        if (updatedCount > 0) this.save();
        return updatedCount;
      }
    };
  }

  public get Reports() {
    return {
      create: async (data: any) => {
        if (!this.data.reports) this.data.reports = [];
        const newReport: UserReport = {
          id: 'rep_' + crypto.randomUUID(),
          reporterId: data.reporterId,
          reportedUserId: data.reportedUserId,
          reason: data.reason,
          createdAt: new Date().toISOString()
        };
        this.data.reports.push(newReport);
        this.save();
        return newReport;
      },
      find: async (filter?: any) => {
        if (!this.data.reports) this.data.reports = [];
        let list = this.data.reports;
        if (filter) {
          list = list.filter((item: any) => Object.keys(filter).every(k => item[k] === filter[k]));
        }
        return list;
      }
    };
  }

  public get PriceAlerts() {
    return {
      find: async (filter?: any) => {
        if (!this.data.priceAlerts) this.data.priceAlerts = [];
        let list = this.data.priceAlerts;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      findById: async (id: string) => {
        if (!this.data.priceAlerts) this.data.priceAlerts = [];
        return this.data.priceAlerts.find(a => a.id === id) || null;
      },
      create: async (alertData: any) => {
        if (!this.data.priceAlerts) this.data.priceAlerts = [];
        const newAlert: PriceAlert = {
          id: 'alert_' + crypto.randomUUID(),
          userId: alertData.userId,
          speciesName: alertData.speciesName,
          region: alertData.region,
          targetPrice: Number(alertData.targetPrice),
          createdAt: new Date().toISOString()
        };
        this.data.priceAlerts.push(newAlert);
        this.save();
        return newAlert;
      },
      findByIdAndDelete: async (id: string) => {
        if (!this.data.priceAlerts) this.data.priceAlerts = [];
        const found = this.data.priceAlerts.some(a => a.id === id);
        this.data.priceAlerts = this.data.priceAlerts.filter(a => a.id !== id);
        this.save();
        return found;
      }
    };
  }

  public get Notifications() {
    return {
      find: async (filter?: any) => {
        if (!this.data.notifications) this.data.notifications = [];
        let list = this.data.notifications;
        if (filter) {
          list = list.filter((item: any) => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
          });
        }
        return list;
      },
      findById: async (id: string) => {
        if (!this.data.notifications) this.data.notifications = [];
        return this.data.notifications.find(n => n.id === id) || null;
      },
      create: async (notifData: any) => {
        if (!this.data.notifications) this.data.notifications = [];
        const newNotif: Notification = {
          id: 'notif_' + crypto.randomUUID(),
          userId: notifData.userId,
          title: notifData.title,
          message: notifData.message,
          type: notifData.type || 'general',
          isRead: !!notifData.isRead,
          createdAt: new Date().toISOString()
        };
        this.data.notifications.push(newNotif);
        this.save();
        return newNotif;
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        if (!this.data.notifications) this.data.notifications = [];
        const index = this.data.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          this.data.notifications[index] = { ...this.data.notifications[index], ...update };
          this.save();
          return this.data.notifications[index];
        }
        return null;
      },
      findByIdAndDelete: async (id: string) => {
        if (!this.data.notifications) this.data.notifications = [];
        const found = this.data.notifications.some(n => n.id === id);
        this.data.notifications = this.data.notifications.filter(n => n.id !== id);
        this.save();
        return found;
      },
      markAllAsRead: async (userId: string) => {
        if (!this.data.notifications) this.data.notifications = [];
        this.data.notifications.forEach(n => {
          if (n.userId === userId) {
            n.isRead = true;
          }
        });
        this.save();
        return true;
      }
    };
  }
}

export const db = new Database();
export const User = db.Users;
export const Tree = db.Trees;
export const Order = db.Orders;
export const Payment = db.Payments;
export const Review = db.Reviews;
export const Wishlist = db.Wishlist;
export const Message = db.Messages;
export const Species = db.Species;
export const TimberMarketPrice = db.TimberMarketPrices;
export const PriceAlert = db.PriceAlerts;
export const Notification = db.Notifications;
export const Report = db.Reports;
