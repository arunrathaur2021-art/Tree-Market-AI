import { Response } from 'express';
import { Payment, Order } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import crypto from 'crypto';

export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    if (!orderId || !paymentMethod || !amount) {
      return res.status(400).json({ error: "Missing required transaction credentials." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Purchase order not found." });
    }

    // Record the payment
    const payment = await Payment.create({
      orderId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: Number(amount),
      paymentMethod,
      transactionId: 'tx_razorpay_' + crypto.randomBytes(8).toString('hex'),
      status: 'success'
    });

    // Mark order as paid
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid'
    });

    res.status(201).json(payment);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to compile transaction processing." });
  }
};

export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user?.role;
    let payments = [];

    if (role === 'admin') {
      payments = await Payment.find();
    } else if (role === 'buyer') {
      payments = await Payment.find({ buyerId: req.user?.userId });
    } else if (role === 'seller') {
      payments = await Payment.find({ sellerId: req.user?.userId });
    }

    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve payment records." });
  }
};
