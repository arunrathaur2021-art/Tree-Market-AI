import { Response } from 'express';
import { PriceAlert, Notification, Tree, TimberMarketPrice } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function checkAndTriggerPriceAlerts(data: any, isMandiPrice: boolean) {
  try {
    const alerts = await PriceAlert.find();
    if (!alerts || alerts.length === 0) return;

    for (const alert of alerts) {
      if (isMandiPrice) {
        const timber = data as any;
        const matchesSpecies = timber.speciesName.toLowerCase().includes(alert.speciesName.toLowerCase()) || 
                             alert.speciesName.toLowerCase().includes(timber.speciesName.toLowerCase());
        const matchesRegion = alert.region === 'All India' || timber.state.toLowerCase() === alert.region.toLowerCase();
        
        if (matchesSpecies && matchesRegion) {
          if (timber.mandiPricePerCft <= alert.targetPrice) {
            const existingNotifs = await Notification.find({ userId: alert.userId });
            const today = new Date().toISOString().split('T')[0];
            const alreadyNotified = existingNotifs.some(n => 
              n.message.includes(timber.speciesName) && 
              n.message.includes(`₹${timber.mandiPricePerCft}`) && 
              n.createdAt.startsWith(today)
            );

            if (!alreadyNotified) {
              await Notification.create({
                userId: alert.userId,
                title: `Price Drop: ${timber.speciesName} Mandi Price`,
                message: `The mandi price for ${timber.speciesName} in ${timber.state} is now ₹${timber.mandiPricePerCft}/CFT, which is within your target of ₹${alert.targetPrice}/CFT.`,
                type: 'price_alert',
                isRead: false
              });
            }
          }
        }
      } else {
        const tree = data as any;
        if (tree.status !== 'approved') continue;

        const speciesNameStr = tree.species || tree.scientificName || tree.category || tree.name;
        const matchesSpecies = speciesNameStr.toLowerCase().includes(alert.speciesName.toLowerCase()) || 
                             alert.speciesName.toLowerCase().includes(speciesNameStr.toLowerCase());
        const matchesRegion = alert.region === 'All India' || tree.state.toLowerCase() === alert.region.toLowerCase();

        if (matchesSpecies && matchesRegion) {
          const actualPrice = tree.expectedPrice;
          if (actualPrice <= alert.targetPrice) {
            const existingNotifs = await Notification.find({ userId: alert.userId });
            const alreadyNotified = existingNotifs.some(n => n.message.includes(tree.id));

            if (!alreadyNotified) {
              await Notification.create({
                userId: alert.userId,
                title: `Listing Alert: ${tree.name}`,
                message: `A new listing for ${speciesNameStr} in ${tree.state} (${tree.district}) is available for ₹${actualPrice.toLocaleString('en-IN')}, matching your target price of ₹${alert.targetPrice.toLocaleString('en-IN')}. (ID: ${tree.id})`,
                type: 'price_alert',
                isRead: false
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error triggering price alerts:", err);
  }
}

export const getAlerts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const list = await PriceAlert.find({ userId: req.user.userId });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch price alerts" });
  }
};

export const createAlert = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { speciesName, region, targetPrice } = req.body;
    if (!speciesName || !region || !targetPrice) {
      return res.status(400).json({ error: "Species name, region, and target price are required." });
    }

    const newAlert = await PriceAlert.create({
      userId: req.user.userId,
      speciesName: speciesName.trim(),
      region: region.trim(),
      targetPrice: Number(targetPrice)
    });

    // Run immediate check
    const allTrees = await Tree.find({ status: 'approved' });
    const allMandiPrices = await TimberMarketPrice.find();

    let matchesFound = 0;

    for (const timber of allMandiPrices) {
      const matchesSpecies = timber.speciesName.toLowerCase().includes(newAlert.speciesName.toLowerCase()) || 
                           newAlert.speciesName.toLowerCase().includes(timber.speciesName.toLowerCase());
      const matchesRegion = newAlert.region === 'All India' || timber.state.toLowerCase() === newAlert.region.toLowerCase();
      
      if (matchesSpecies && matchesRegion && timber.mandiPricePerCft <= newAlert.targetPrice) {
        await Notification.create({
          userId: req.user.userId,
          title: `Instant Match: ${timber.speciesName} Mandi Price`,
          message: `The current mandi price for ${timber.speciesName} in ${timber.state} is ₹${timber.mandiPricePerCft}/CFT, which is within your alert target of ₹${newAlert.targetPrice}/CFT.`,
          type: 'price_alert',
          isRead: false
        });
        matchesFound++;
      }
    }

    for (const tree of allTrees) {
      const speciesNameStr = tree.species || tree.scientificName || tree.category || tree.name;
      const matchesSpecies = speciesNameStr.toLowerCase().includes(newAlert.speciesName.toLowerCase()) || 
                           newAlert.speciesName.toLowerCase().includes(speciesNameStr.toLowerCase());
      const matchesRegion = newAlert.region === 'All India' || tree.state.toLowerCase() === newAlert.region.toLowerCase();

      if (matchesSpecies && matchesRegion && tree.expectedPrice <= newAlert.targetPrice) {
        await Notification.create({
          userId: req.user.userId,
          title: `Instant Match: ${tree.name}`,
          message: `A listing for ${speciesNameStr} in ${tree.state} is available for ₹${tree.expectedPrice.toLocaleString('en-IN')}, matching your alert target of ₹${newAlert.targetPrice.toLocaleString('en-IN')}. (ID: ${tree.id})`,
          type: 'price_alert',
          isRead: false
        });
        matchesFound++;
      }
    }

    res.status(201).json({ alert: newAlert, matchesFound });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create price alert" });
  }
};

export const deleteAlert = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const existing = await PriceAlert.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Price alert not found" });
    }
    if (existing.userId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    await PriceAlert.findByIdAndDelete(id);
    res.json({ success: true, message: "Price alert deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete price alert" });
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const list = await Notification.find({ userId: req.user.userId });
    // Sort by latest first
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    await Notification.markAllAsRead(req.user.userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};

export const markSingleNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const existing = await Notification.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (existing.userId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const existing = await Notification.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (existing.userId !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    await Notification.findByIdAndDelete(id);
    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
