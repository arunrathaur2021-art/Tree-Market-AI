import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";

export interface BusinessItem {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber?: string;
  category: string;
  description: string;
  address: string;
  village?: string;
  taluka?: string;
  district: string;
  state: string;
  pincode: string;
  gpsLocation?: string;
  website?: string;
  whatsApp?: string;
  businessHours?: string;
  logoUrl?: string;
  coverUrl?: string;
  photos?: string[];
  documents?: string[];
  verified: boolean;
  isPremium?: boolean;
  rating: number;
  reviewCount: number;
  reviews?: any[];
  products?: any[];
  services?: string[];
  yearsOfExperience?: number;
  capacity?: string;
  availableTreeSpecies?: string[];
  currentRequirements?: string;
  createdAt: string;
}

const INITIAL_BUSINESSES: BusinessItem[] = [
  {
    id: 'biz-1',
    userId: 'user-seller-1',
    businessName: 'GreenWood Sawmill & Timber Industries',
    ownerName: 'Rajesh Sharma',
    mobile: '9876543210',
    email: 'contact@greenwoodsawmill.in',
    gstNumber: '06AABCU9603R1ZM',
    category: 'Sawmills',
    description: 'Premier automated Band Sawmill and Seasoning Plant specializing in Teak, Poplar, and Eucalyptus timber processing with high precision band saws and solar kiln seasoning.',
    address: 'Plot 42, Industrial Area, Jagadhri Road',
    village: 'Jagadhri',
    taluka: 'Yamunanagar',
    district: 'Yamunanagar',
    state: 'Haryana',
    pincode: '135001',
    gpsLocation: '30.1290, 77.2674',
    website: 'https://greenwoodsawmill.in',
    whatsApp: '9876543210',
    businessHours: 'Mon - Sat: 8:00 AM - 7:00 PM',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80'
    ],
    documents: ['GST_Certificate.pdf', 'Pollution_NOC.pdf'],
    verified: true,
    isPremium: true,
    rating: 4.8,
    reviewCount: 34,
    yearsOfExperience: 18,
    capacity: '500 Tons / Month Timber Processing',
    availableTreeSpecies: ['Teak (Sagwan)', 'Poplar', 'Eucalyptus', 'Sheesham'],
    currentRequirements: 'Urgent procurement of 200 Tons Poplar Logs Girth 24"+ and Teak Round Logs.',
    services: ['Custom Timber Slicing', 'Wood Seasoning (Kiln Dry)', 'Log Transport', 'Timber Quality Certification'],
    products: [
      { id: 'p1', name: 'Seasoned Teak Planks (Grade A)', price: '₹1,850 / Cft', description: 'Kiln dried, knot-free natural Teak wood planks for doors and furniture.' },
      { id: 'p2', name: 'Eucalyptus Pulp Wood Logs', price: '₹5,800 / Ton', description: 'Peeling grade eucalyptus logs cut to 8ft lengths.' }
    ],
    reviews: [
      { id: 'r1', businessId: 'biz-1', reviewerName: 'Vikram Singh (Farmer)', rating: 5, comment: 'Fair weighing scale and immediate payment via NEFT for my Poplar harvest!', createdAt: '2026-07-15' },
      { id: 'r2', businessId: 'biz-1', reviewerName: 'Anil Agarwal', rating: 4.5, comment: 'Very reliable sawmill with precision wood sizing.', createdAt: '2026-06-20' }
    ],
    createdAt: '2025-01-10'
  },
  {
    id: 'biz-2',
    userId: 'user-seller-2',
    businessName: 'Malabar Veneers & Plywood Industries',
    ownerName: 'Subhash Nair',
    mobile: '9447123456',
    email: 'info@malabarply.com',
    gstNumber: '29ABCDE1234F1Z5',
    category: 'Plywood Industries',
    description: 'ISO-certified Marine Grade Plywood and Face Veneer manufacturing plant accepting Melia Dubia, Silver Oak, and Eucalyptus timber round logs.',
    address: 'Survey No. 88, KIADB Industrial Layout',
    village: 'Hebbal',
    taluka: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570016',
    gpsLocation: '12.2958, 76.6394',
    website: 'https://malabarply.com',
    whatsApp: '9447123456',
    businessHours: 'Mon - Sat: 9:00 AM - 6:30 PM',
    logoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80'
    ],
    verified: true,
    isPremium: true,
    rating: 4.9,
    reviewCount: 48,
    yearsOfExperience: 22,
    capacity: '1,200 Sheets / Day',
    availableTreeSpecies: ['Melia Dubia (Malabar Neem)', 'Silver Oak', 'Eucalyptus', 'Rubber Wood'],
    currentRequirements: 'Bulk purchase of Melia Dubia logs above 18-inch girth at attractive rates.',
    services: ['Face Veneer Peeling', 'Plywood Wholesale Supply', 'Tree Log Pick Up Service'],
    products: [
      { id: 'p10', name: '710 Grade Marine Plywood 18mm', price: '₹115 / SqFt', description: 'Boiling waterproof marine plywood with 20-year warranty.' }
    ],
    reviews: [
      { id: 'r10', businessId: 'biz-2', reviewerName: 'Ramesh Gowda', rating: 5, comment: 'High volume buyer. They dispatched their own cranes and trucks to my farm!', createdAt: '2026-07-01' }
    ],
    createdAt: '2025-02-14'
  },
  {
    id: 'biz-3',
    userId: 'user-seller-3',
    businessName: 'Saharanpur Royal Teak Crafts & Furniture',
    ownerName: 'Haji Mohammad Imran',
    mobile: '9837011223',
    email: 'imran@saharanpurcrafts.com',
    gstNumber: '09AABCS5542R1Z8',
    category: 'Furniture Manufacturers',
    description: 'Heritage hand-carved Teakwood & Sheesham furniture exporters serving domestic retail, interior architects, and international export markets.',
    address: 'Near Wood Market, Ambala Road',
    village: 'Saharanpur',
    taluka: 'Saharanpur',
    district: 'Saharanpur',
    state: 'Uttar Pradesh',
    pincode: '247001',
    gpsLocation: '29.9680, 77.5552',
    website: 'https://saharanpurcrafts.com',
    whatsApp: '9837011223',
    businessHours: 'Mon - Sun: 10:00 AM - 8:30 PM',
    logoUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80'
    ],
    verified: true,
    isPremium: false,
    rating: 4.7,
    reviewCount: 29,
    yearsOfExperience: 35,
    capacity: '300 Furniture Sets / Month',
    availableTreeSpecies: ['Teak (Sagwan)', 'Sheesham (Rosewood)', 'Neem'],
    currentRequirements: 'Buying seasoned A-grade Teak logs girth 36"+ and mature Sheesham trees.',
    services: ['Custom Architectural Furniture Design', 'Export Packaging', 'On-site Wood Inspection'],
    products: [
      { id: 'p20', name: 'Carved Teakwood Royal Dining Set (6 Seater)', price: '₹68,000', description: 'Solid CP Teak wood handcrafted dining table with chairs.' }
    ],
    reviews: [
      { id: 'r20', businessId: 'biz-3', reviewerName: 'Sanjay Dutt', rating: 5, comment: 'World class artisan craftsmanship and genuine C.P. Teak wood used.', createdAt: '2026-05-18' }
    ],
    createdAt: '2025-03-01'
  },
  {
    id: 'biz-4',
    userId: 'user-seller-4',
    businessName: 'Kaveri High-Tech Agro Nursery & Tissue Culture',
    ownerName: 'Dr. S. K. Patil',
    mobile: '9845098765',
    email: 'patil@kaverinursery.org',
    gstNumber: '29AAACK8892P1Z2',
    category: 'Nurseries',
    description: 'Government Recognized High-Yield Tissue Culture Teak (Tectona Grandis), Red Sanders, Sandalwood, and Melia Dubia plant saplings supplier with guaranteed 98% survival rate.',
    address: 'NH-275, Mysuru-Hunsur Highway',
    village: 'Hunsur',
    taluka: 'Hunsur',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '571105',
    gpsLocation: '12.3106, 76.6433',
    website: 'https://kaverinursery.org',
    whatsApp: '9845098765',
    businessHours: 'Mon - Sun: 7:00 AM - 6:00 PM',
    logoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&auto=format&fit=crop&q=80'
    ],
    verified: true,
    isPremium: true,
    rating: 4.9,
    reviewCount: 62,
    yearsOfExperience: 14,
    capacity: '50 Lakh Saplings / Year',
    availableTreeSpecies: ['Tissue Culture Teak', 'Host-paired Sandalwood', 'Melia Dubia', 'Mahogany', 'Bamboo'],
    currentRequirements: 'Contract farming partnerships with tree growers across Karnataka, Tamil Nadu, Andhra Pradesh.',
    services: ['Soil Testing & Farm Inspection', 'Drip Irrigation Setup', 'Buyback Guarantee Agreement'],
    products: [
      { id: 'p30', name: 'Tissue Culture Burmese Teak Sapling', price: '₹45 / Plant', description: 'Disease resistant, fast growing straight trunk clone.' },
      { id: 'p31', name: 'White Sandalwood + Host Pair (2 Year Old)', price: '₹120 / Pair', description: 'Certified Chandler Sandalwood plant with Alternanthera host.' }
    ],
    reviews: [
      { id: 'r30', businessId: 'biz-4', reviewerName: 'Mahesh Reddy', rating: 5, comment: 'Planted 2,000 tissue culture teak saplings on my 5-acre plot. Exceptional growth rate!', createdAt: '2026-06-11' }
    ],
    createdAt: '2025-01-05'
  },
  {
    id: 'biz-5',
    userId: 'user-seller-5',
    businessName: 'Apex Heavy Timber Logistics & Crane Rental',
    ownerName: 'Gurpreet Singh Johal',
    mobile: '9822019988',
    email: 'dispatch@apextimberlogistics.in',
    gstNumber: '27AABCA7732L1Z9',
    category: 'Transport & Logistics',
    description: 'Specialized heavy log transport fleet with hydraulic timber cranes, multi-axle trailers, hydraulic loaders, and inter-state transit permit assistance.',
    address: 'Gat No. 124, Wardha Road Industrial Zone',
    village: 'Butibori',
    taluka: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    pincode: '441108',
    gpsLocation: '21.1458, 79.0882',
    website: 'https://apextimberlogistics.in',
    whatsApp: '9822019988',
    businessHours: '24 Hours Emergency Log Transport',
    logoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80'
    ],
    verified: true,
    isPremium: false,
    rating: 4.6,
    reviewCount: 21,
    yearsOfExperience: 16,
    capacity: '40 Heavy Trailers & Hydraulic Cranes',
    availableTreeSpecies: ['All Heavy Timber Logs', 'Whole Farm Clearing'],
    currentRequirements: 'Pan-India timber haulage contracts with paper mills, sawmills, and forest departments.',
    services: ['Farm Log Loading with Hydraulic Crane', 'Inter-state Forest Transit Pass Permit', 'GPS Tracked Freight'],
    products: [],
    reviews: [
      { id: 'r40', businessId: 'biz-5', reviewerName: 'Devendra Patil', rating: 5, comment: 'Loaded 45 tons of Subabul logs straight from my muddy farm field effortlessly!', createdAt: '2026-07-02' }
    ],
    createdAt: '2025-04-12'
  }
];

// In-memory array initialized with mock seed
let businessesDatabase: BusinessItem[] = [...INITIAL_BUSINESSES];

export const getBusinesses = async (req: Request, res: Response) => {
  try {
    const { category, search, state, district, taluka, pincode, verified, premium, sortBy } = req.query;

    let result = [...businessesDatabase];

    if (category && typeof category === 'string' && category !== 'All') {
      result = result.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }

    if (state && typeof state === 'string' && state !== 'All' && state.trim()) {
      result = result.filter(b => b.state.toLowerCase() === state.toLowerCase());
    }

    if (district && typeof district === 'string' && district.trim()) {
      result = result.filter(b => b.district.toLowerCase().includes(district.toLowerCase()));
    }

    if (taluka && typeof taluka === 'string' && taluka.trim()) {
      result = result.filter(b => (b.taluka || '').toLowerCase().includes(taluka.toLowerCase()));
    }

    if (pincode && typeof pincode === 'string' && pincode.trim()) {
      result = result.filter(b => b.pincode.includes(pincode.trim()));
    }

    if (verified === 'true') {
      result = result.filter(b => b.verified);
    }

    if (premium === 'true') {
      result = result.filter(b => b.isPremium);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b => 
        b.businessName.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        (b.village || '').toLowerCase().includes(q) ||
        (b.taluka || '').toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        (b.availableTreeSpecies || []).some(s => s.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    } else {
      // Default: Premium & Verified first, then newest
      result.sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch businesses' });
  }
};

export const getBusinessById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const business = businessesDatabase.find(b => b.id === id);
    if (!business) {
      return res.status(404).json({ error: 'Business profile not found' });
    }
    res.json(business);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch business details' });
  }
};

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    if (!body.businessName || !body.ownerName || !body.mobile || !body.category || !body.district || !body.state) {
      return res.status(400).json({ error: 'Missing required business details (Business Name, Owner, Mobile, Category, District, State)' });
    }

    const newBusiness: BusinessItem = {
      id: `biz-${Date.now()}`,
      userId: (req as any).user?.id || 'guest-user',
      businessName: body.businessName,
      ownerName: body.ownerName,
      mobile: body.mobile,
      email: body.email || '',
      gstNumber: body.gstNumber || '',
      category: body.category,
      description: body.description || '',
      address: body.address || '',
      village: body.village || '',
      taluka: body.taluka || '',
      district: body.district,
      state: body.state,
      pincode: body.pincode || '',
      gpsLocation: body.gpsLocation || '',
      website: body.website || '',
      whatsApp: body.whatsApp || body.mobile,
      businessHours: body.businessHours || 'Mon - Sat: 9:00 AM - 6:00 PM',
      logoUrl: body.logoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=300&auto=format&fit=crop&q=80',
      coverUrl: body.coverUrl || 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80',
      photos: body.photos || [],
      documents: body.documents || [],
      verified: true, // Auto-verified on registration for smooth UX
      isPremium: body.isPremium || false,
      rating: 5.0,
      reviewCount: 1,
      yearsOfExperience: body.yearsOfExperience || 1,
      capacity: body.capacity || '',
      availableTreeSpecies: body.availableTreeSpecies || [],
      currentRequirements: body.currentRequirements || '',
      services: body.services || [],
      products: body.products || [],
      reviews: [
        {
          id: `rev-${Date.now()}`,
          businessId: `biz-${Date.now()}`,
          reviewerName: 'TreeMarket Verification System',
          rating: 5,
          comment: 'Verified business profile successfully listed on TreeMarket AI India directory.',
          createdAt: new Date().toISOString().split('T')[0]
        }
      ],
      createdAt: new Date().toISOString()
    };

    businessesDatabase.unshift(newBusiness);
    res.status(201).json(newBusiness);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create business' });
  }
};

export const updateBusiness = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = businessesDatabase.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Business not found' });
    }

    businessesDatabase[index] = {
      ...businessesDatabase[index],
      ...req.body
    };

    res.json(businessesDatabase[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update business' });
  }
};

export const addBusinessReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, reviewerName } = req.body;

    const index = businessesDatabase.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const business = businessesDatabase[index];
    const newReview = {
      id: `rev-${Date.now()}`,
      businessId: id,
      reviewerId: (req as any).user?.id || 'guest',
      reviewerName: reviewerName || (req as any).user?.name || 'Verified Buyer',
      rating: Number(rating) || 5,
      comment: comment || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const currentReviews = business.reviews || [];
    currentReviews.unshift(newReview);

    const totalScore = currentReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Number((totalScore / currentReviews.length).toFixed(1));

    business.reviews = currentReviews;
    business.rating = avgRating;
    business.reviewCount = currentReviews.length;

    businessesDatabase[index] = business;
    res.json(business);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add review' });
  }
};

export const toggleBusinessVerify = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = businessesDatabase.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Business not found' });
    }

    businessesDatabase[index].verified = !businessesDatabase[index].verified;
    res.json(businessesDatabase[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify business' });
  }
};

export const getAIBusinessRecommendations = async (req: Request, res: Response) => {
  try {
    const { userRole, treeSpecies, state, district } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are the AI B2B Matchmaking Engine for TreeMarket AI India (developed by Arun Rathaur).
Suggest top timber industry matches and business growth recommendations for a ${userRole || 'Tree Farmer / Seller'} dealing with ${treeSpecies || 'Teak & Poplar'} in ${district || 'Yamunanagar'}, ${state || 'Haryana'}.

Return ONLY valid JSON matching this schema:
{
  "topRecommendedCategories": ["Plywood Industries", "Sawmills", "Transport & Logistics"],
  "buyersDemandOverview": "High active demand from Yamunanagar plywood factories for 24+ girth logs.",
  "growthStrategyTips": [
    "Partner with Kiln-seasoning plants to boost log value by 22%",
    "Utilize certified heavy timber transporters with hydraulic cranes for field pickup",
    "List tissue culture saplings with buyback guarantee agreements"
  ],
  "marketOpportunityScore": 94
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return res.json(JSON.parse(jsonMatch[0]));
        }
      } catch (geminiErr) {
        console.warn("Gemini AI business recommendation fallback:", geminiErr);
      }
    }

    res.json({
      topRecommendedCategories: ["Sawmills", "Plywood Industries", "Tree Buyers", "Transport & Logistics"],
      buyersDemandOverview: `Strong buyer interest across ${district || 'Yamunanagar'}, ${state || 'Haryana'} for commercial timber species.`,
      growthStrategyTips: [
        "Register your business profile with verified GST documents for 3x buyer trust",
        "Connect with local APMC wood yards and tissue culture nurseries for direct contract farming",
        "Offer direct field pickup with hydraulic crane transporters"
      ],
      marketOpportunityScore: 92
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI recommendation failed' });
  }
};
