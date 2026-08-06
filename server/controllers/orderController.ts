import { Response } from 'express';
import { Order, Tree, User } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'buyer') {
      return res.status(403).json({ error: "Access denied. Only buyers can place orders." });
    }

    const { treeId, quantity, paymentMethod, deliveryAddress } = req.body;
    if (!treeId || !quantity || !paymentMethod || !deliveryAddress) {
      return res.status(400).json({ error: "Missing required checkout parameters." });
    }

    const tree = await Tree.findById(treeId);
    if (!tree) {
      return res.status(404).json({ error: "Tree listing not found." });
    }

    if (tree.quantity < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Only ${tree.quantity} trees available.` });
    }

    const buyer = await User.findById(req.user.userId);
    if (!buyer) {
      return res.status(404).json({ error: "Buyer session profile not found." });
    }

    const totalAmount = tree.expectedPrice * Number(quantity);

    const newOrder = await Order.create({
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerContact: buyer.contactNumber || "+91 9999999999",
      sellerId: tree.sellerId,
      sellerName: tree.sellerName,
      sellerContact: tree.sellerContact,
      treeId: tree.id,
      treeName: tree.name,
      pricePerTree: tree.expectedPrice,
      quantity: Number(quantity),
      totalAmount,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', // simulated digital payments auto-approve
      paymentMethod,
      deliveryAddress: {
        state: deliveryAddress.state || tree.state,
        district: deliveryAddress.district || tree.district,
        tehsil: deliveryAddress.tehsil || "",
        village: deliveryAddress.village || "",
        pincode: deliveryAddress.pincode || ""
      }
    });

    // Update tree remaining inventory quantity
    await Tree.findByIdAndUpdate(treeId, {
      quantity: tree.quantity - quantity
    });

    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to place order." });
  }
};

export const getBuyerOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'buyer') {
      return res.status(403).json({ error: "Access denied." });
    }
    const orders = await Order.find({ buyerId: req.user.userId });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch purchase orders." });
  }
};

export const getSellerOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ error: "Access denied." });
    }
    const orders = await Order.find({ sellerId: req.user.userId });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch customer orders." });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted', 'rejected', 'completed', 'cancelled'
    
    if (!status) {
      return res.status(400).json({ error: "Please provide order update status." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Security check: Only the seller or buyer can cancel, only the seller can accept/reject/complete
    const isSeller = req.user?.userId === order.sellerId;
    const isBuyer = req.user?.userId === order.buyerId;

    if (!isSeller && !isBuyer && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Unauthorized." });
    }

    if (status === 'cancelled' && !isBuyer && !isSeller) {
      return res.status(403).json({ error: "Only buyer or seller can cancel this order." });
    }

    if ((status === 'accepted' || status === 'rejected' || status === 'completed') && !isSeller && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Only the listing seller can change order state to " + status });
    }

    // If order is rejected or cancelled, restore the tree quantity
    if (status === 'rejected' || status === 'cancelled') {
      const tree = await Tree.findById(order.treeId);
      if (tree) {
        await Tree.findByIdAndUpdate(order.treeId, {
          quantity: tree.quantity + order.quantity
        });
      }
    }

    const updated = await Order.findByIdAndUpdate(id, {
      status,
      paymentStatus: status === 'completed' ? 'paid' : order.paymentStatus
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update order state." });
  }
};

export const getSellerAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ error: "Access denied." });
    }

    const orders = await Order.find({ sellerId: req.user.userId });
    const listings = await Tree.find({ sellerId: req.user.userId });

    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
    const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
    
    // Total revenue is from completed orders
    const totalRevenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const activeListingsCount = listings.filter((l) => l.status === 'approved').length;
    const pendingApprovalCount = listings.filter((l) => l.status === 'pending').length;

    // Group sales by Category for seller charts
    const categorySales: { [key: string]: number } = {};
    orders
      .filter((o) => o.status === 'completed')
      .forEach((o) => {
        const item = listings.find((l) => l.id === o.treeId);
        const cat = item ? item.category : "Timber";
        categorySales[cat] = (categorySales[cat] || 0) + o.totalAmount;
      });

    const categorySalesArray = Object.keys(categorySales).map((cat) => ({
      category: cat,
      revenue: categorySales[cat]
    }));

    res.json({
      totalRevenue,
      totalOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      activeListingsCount,
      pendingApprovalCount,
      categorySales: categorySalesArray
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate seller revenue analytics." });
  }
};
