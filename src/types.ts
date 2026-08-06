export interface Region {
  country: string;
  state: string;
  district: string;
  taluka: string;
  block?: string;
  village: string;
  pincode: string;
  lat: number;
  lng: number;

  // Full Address Details
  fullAddress?: string;
  houseNo?: string;
  street?: string;
  landmark?: string;
  city?: string;
  isCustomAddress?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  contactNumber?: string;
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
}

export interface Tree {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  name: string;
  localName?: string;
  scientificName?: string;
  category?: string;
  species: string;
  age: number;
  height: number;
  diameter: number;
  quantity: number;
  price: number;
  expectedPrice?: number;
  negotiable?: boolean;
  harvestReady?: boolean;
  description: string;
  location: string;
  state: string;
  district: string;
  tehsil?: string;
  village?: string;
  pincode: string;
  gpsLocation?: string;
  images: string[];
  videos?: string[];
  createdAt: string;

  // New detailed inputs
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

  // Premium AI Estimation outputs stored directly on the Tree
  aiEstimation?: TreeAIEstimation;
}

export interface TreeAIEstimation {
  // Volume and Prices
  estimatedTimberVolume: number;
  expectedMarketPrice: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  suggestedSellingPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  auctionValue: number;
  futurePrice1Year: number;
  futurePrice3Years: number;
  futurePrice5Years: number;
  profitNow: number;
  profitLater: number;
  confidenceScore: number;

  // Price Breakdown
  baseWoodPrice: number;
  timberQualityBonus: number;
  diameterBonus: number;
  heightBonus: number;
  ageBonus: number;
  healthBonus: number;
  locationAdjustment: number;
  transportDeduction: number;
  demandAdjustment: number;
  governmentTaxEstimate: number;
  estimatedFinalSellingPrice: number;

  // AI Scores
  treeQualityScore: number;
  timberGradeResult: 'Grade A' | 'Grade B' | 'Grade C';
  commercialGrade: 'Prime' | 'Commercial' | 'Utility';
  investmentGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  harvestReadiness: 'Ready' | 'Growing' | 'Early';
  marketDemand: 'High' | 'Medium' | 'Low';
  buyerInterest: 'High' | 'Medium' | 'Low';
  overallAiRating: number;

  // Text Analytics
  marketAnalysis: string;
  growthPotential: string;
  professionalDescription: string;
  careInstructions: string;
  carbonStorage: number; // kg of CO2 equivalent
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

export interface Review {
  id: string;
  treeId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PriceComparison {
  lowestPrice: number;
  highestPrice: number;
  avgPrice: number;
  isBestPrice: boolean;
  similarSellerOffers: {
    id: string;
    name: string;
    price: number;
    sellerName: string;
    location: string;
    image: string;
  }[];
}

export interface AIEstimationResult {
  suggestedPriceRange: string;
  marketAnalysis: string;
  growthPotential: string;
  professionalDescription: string;
  careInstructions: string;
}

export interface BusinessProduct {
  id: string;
  name: string;
  price: string;
  description: string;
  image?: string;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  reviewerId?: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes?: number;
}

export interface Business {
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
  reviews?: BusinessReview[];
  products?: BusinessProduct[];
  services?: string[];
  yearsOfExperience?: number;
  capacity?: string;
  availableTreeSpecies?: string[];
  currentRequirements?: string;
  createdAt: string;
}

