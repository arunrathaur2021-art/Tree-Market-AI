import { Response } from 'express';
import { Tree, User, Wishlist, Review, db } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import crypto from 'crypto';
import { checkAndTriggerPriceAlerts } from './alertController.js';

export const getTrees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, category, state, district, minPrice, maxPrice, sellerId, negotiable, harvestReady } = req.query;
    let listings = await Tree.find();

    // Default: buyers should only see approved listings, while sellers can see their own listings even if pending
    if (sellerId) {
      listings = listings.filter((t) => t.sellerId === sellerId);
    } else {
      listings = listings.filter((t) => t.status === 'approved');
    }

    // Filters
    if (search) {
      const q = (search as string).toLowerCase().trim();
      listings = listings.filter((t) => 
        t.name.toLowerCase().includes(q) ||
        t.localName.toLowerCase().includes(q) ||
        t.scientificName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.district.toLowerCase().includes(q) ||
        t.state.toLowerCase().includes(q)
      );
    }

    if (category) {
      const cat = (category as string).toLowerCase().trim();
      listings = listings.filter((t) => t.category.toLowerCase() === cat);
    }

    if (state) {
      const st = (state as string).toLowerCase().trim();
      listings = listings.filter((t) => t.state.toLowerCase().includes(st));
    }

    if (district) {
      const ds = (district as string).toLowerCase().trim();
      listings = listings.filter((t) => t.district.toLowerCase().includes(ds));
    }

    if (minPrice) {
      listings = listings.filter((t) => t.expectedPrice >= Number(minPrice));
    }

    if (maxPrice) {
      listings = listings.filter((t) => t.expectedPrice <= Number(maxPrice));
    }

    if (negotiable !== undefined) {
      const neg = negotiable === 'true';
      listings = listings.filter((t) => t.negotiable === neg);
    }

    if (harvestReady !== undefined) {
      const rdy = harvestReady === 'true';
      listings = listings.filter((t) => t.harvestReady === rdy);
    }

    // Sort by latest
    listings = [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch tree listings" });
  }
};

export const getTreeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tree = await Tree.findById(id);
    if (!tree) {
      return res.status(404).json({ error: "Tree listing not found" });
    }

    // Fetch related reviews
    const reviews = await Review.find({ treeId: id });

    // 1. Core Price Comparison Analytics
    const allTrees = await Tree.find();
    
    // Match by category
    const categoryTrees = allTrees.filter(
      (t) => t.category.toLowerCase() === tree.category.toLowerCase() && t.status === 'approved'
    );

    const prices = categoryTrees.map((t) => t.expectedPrice);
    
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : tree.expectedPrice;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : tree.expectedPrice;
    const avgPrice = prices.length > 0 
      ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) 
      : tree.expectedPrice;

    // Best Price Badge logic
    const isBestPrice = tree.expectedPrice <= (avgPrice * 0.95) || tree.expectedPrice === lowestPrice;

    // 2. Nearby seller prices calculation (same state/district)
    const nearbySellerOffers = allTrees
      .filter((t) => t.id !== tree.id && t.status === 'approved' && (t.state.toLowerCase() === tree.state.toLowerCase() || t.district.toLowerCase() === tree.district.toLowerCase()))
      .slice(0, 4)
      .map((t) => ({
        id: t.id,
        name: t.name,
        price: t.expectedPrice,
        sellerName: t.sellerName,
        location: `${t.district}, ${t.state}`,
        image: t.images[0] || ""
      }));

    // 3. Similar Tree Listings (by category or state)
    const similarTrees = allTrees
      .filter((t) => t.id !== tree.id && t.status === 'approved' && (t.category === tree.category || t.state === tree.state))
      .slice(0, 4);

    res.json({
      tree,
      reviews,
      priceComparison: {
        lowestPrice,
        highestPrice,
        avgPrice,
        isBestPrice,
        similarSellerOffers: nearbySellerOffers,
      },
      similarTrees
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load tree analysis and details" });
  }
};

export const createTree = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: "Access denied. Only sellers can list trees." });
    }

    const { 
      name, localName, scientificName, category, age, height, diameter, 
      quantity, expectedPrice, negotiable, harvestReady, description, 
      images, videos, state, district, tehsil, village, pincode, gpsLocation,
      
      // Extra Arborist Fields
      species, trunkCircumference, healthCondition, growthRate, trunkStraightness,
      woodDensity, moistureLevel, timberGrade, landType, soilType, rainfallZone,
      hasDroneImages, videoUrl, aiEstimation
    } = req.body;

    if (!name || !expectedPrice || !quantity || !state || !district || !pincode) {
      return res.status(400).json({ error: "Please provide all required fields, including location and price." });
    }

    const seller = await User.findById(req.user.userId);
    if (!seller) {
      return res.status(404).json({ error: "Seller profile not found" });
    }

    const newTree = await Tree.create({
      sellerId: seller.id,
      sellerName: seller.name,
      sellerContact: seller.contactNumber || "+91 9999999999",
      name: name.trim(),
      localName: localName?.trim() || "",
      scientificName: scientificName?.trim() || "",
      category: category || "Other",
      age: Number(age) || 5,
      height: Number(height) || 10,
      diameter: Number(diameter) || 4,
      quantity: Number(quantity) || 1,
      expectedPrice: Number(expectedPrice),
      negotiable: negotiable === true || negotiable === 'true',
      harvestReady: harvestReady === true || harvestReady === 'true',
      description: description?.trim() || `Healthy ${name} tree ready for trade in ${district}, ${state}.`,
      images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600&auto=format&fit=crop"],
      videos: Array.isArray(videos) ? videos : [],
      state: state.trim(),
      district: district.trim(),
      tehsil: tehsil?.trim() || "",
      village: village?.trim() || "",
      pincode: pincode.trim(),
      gpsLocation: gpsLocation?.trim() || "",
      status: req.user.role === 'admin' ? 'approved' : 'pending', // Admin listings are auto-approved, seller listings require approval

      // Extra Arborist Fields
      species: species || scientificName || category || "Teak",
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
      hasDroneImages: hasDroneImages === true || hasDroneImages === 'true',
      videoUrl: videoUrl?.trim() || "",
      aiEstimation
    });

    if (newTree.status === 'approved') {
      await checkAndTriggerPriceAlerts(newTree, false);
    }

    res.status(201).json(newTree);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create tree listing" });
  }
};

export const updateTree = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Tree.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Tree listing not found" });
    }

    // Security check: only the seller who listed or an admin can edit
    if (req.user?.userId !== existing.sellerId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. You do not own this listing." });
    }

    const updated = await Tree.findByIdAndUpdate(id, {
      ...req.body,
      // If a regular seller updates a listing, revert it back to 'pending' status for re-approval
      status: req.user?.role === 'admin' ? (req.body.status || existing.status) : 'pending'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update tree listing" });
  }
};

export const deleteTree = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Tree.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Tree listing not found" });
    }

    if (req.user?.userId !== existing.sellerId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. You do not own this listing." });
    }

    await Tree.findByIdAndDelete(id);
    res.json({ success: true, message: "Tree listing deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete tree listing" });
  }
};

// --- Favorites / Wishlist Operations ---

export const getWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json([]);
    const favs = await Wishlist.find({ userId: req.user.userId });
    const allTrees = await Tree.find();

    const hydrated = favs
      .map((f) => allTrees.find((t) => t.id === f.treeId))
      .filter((t) => t !== undefined);

    res.json(hydrated);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve wishlist items" });
  }
};

export const toggleWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { treeId } = req.params;
    if (!req.user) return res.status(401).json({ error: "Authentication required" });

    const exists = await Wishlist.find({ userId: req.user.userId, treeId });
    if (exists.length > 0) {
      await Wishlist.deleteOne({ userId: req.user.userId, treeId });
      res.json({ added: false, message: "Removed from wishlist" });
    } else {
      await Wishlist.create({ userId: req.user.userId, treeId });
      res.json({ added: true, message: "Added to wishlist" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Failed to toggle wishlist" });
  }
};

// --- Reviews & Comments ---

export const getReviewsByTreeId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { treeId } = req.params;
    const reviews = await Review.find({ treeId });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const postReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const treeId = req.params.treeId || req.body.treeId;
    const { rating, comment } = req.body;
    if (!treeId || !rating || !comment) {
      return res.status(400).json({ error: "Tree ID, rating, and comment description are required" });
    }

    const reviewer = await User.findById(req.user!.userId);
    if (!reviewer) {
      return res.status(404).json({ error: "Reviewer profile not found" });
    }

    const review = await Review.create({
      treeId,
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      rating: Number(rating),
      comment: comment.trim()
    });

    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to post review" });
  }
};
