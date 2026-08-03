import { Response } from 'express';
import { User, Tree, Order, Payment, db } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { checkAndTriggerPriceAlerts } from './alertController.js';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin authorization required." });
    }

    const allUsers = await User.find();
    const allTrees = await Tree.find();
    const allOrders = await Order.find();
    const allPayments = await Payment.find();

    const buyersCount = allUsers.filter(u => u.role === 'buyer').length;
    const sellersCount = allUsers.filter(u => u.role === 'seller').length;
    
    const approvedTrees = allTrees.filter(t => t.status === 'approved').length;
    const pendingTrees = allTrees.filter(t => t.status === 'pending').length;

    const totalTransactionVolume = allOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Group listings by state for trade distribution analytics
    const stateDistribution: { [key: string]: number } = {};
    allTrees.forEach((t) => {
      stateDistribution[t.state] = (stateDistribution[t.state] || 0) + t.quantity;
    });

    const stateStats = Object.keys(stateDistribution).map(state => ({
      state,
      treesCount: stateDistribution[state]
    }));

    res.json({
      buyersCount,
      sellersCount,
      approvedTrees,
      pendingTrees,
      totalListings: allTrees.length,
      totalTransactionVolume,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      stateStats
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate admin reports." });
  }
};

export const approveTreeListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }

    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return res.status(400).json({ error: "Please provide action parameter: 'approve' or 'reject'." });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const updated = await Tree.findByIdAndUpdate(id, { status });

    if (!updated) {
      return res.status(404).json({ error: "Tree listing not found." });
    }

    if (status === 'approved') {
      await checkAndTriggerPriceAlerts(updated, false);
    }

    res.json({ success: true, status, tree: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to approve listing." });
  }
};

export const deleteListingByAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }

    const { id } = req.params;
    const deleted = await Tree.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Tree listing not found." });
    }

    res.json({ success: true, message: "Fake or inappropriate tree listing has been purged." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to purge listing." });
  }
};

export const getManageUsersList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }

    const allUsers = await User.find();
    const safeUsers = allUsers.map(({ passwordHash, ...u }) => u);

    res.json(safeUsers);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load user accounts ledger." });
  }
};

export const deleteUserByAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }

    const { id } = req.params;
    if (id === req.user.userId) {
      return res.status(400).json({ error: "Self-deletion of admin accounts is restricted." });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "User account not found." });
    }

    res.json({ success: true, message: "User account and related records deleted." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete user." });
  }
};
