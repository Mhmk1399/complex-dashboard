import { NextRequest, NextResponse } from 'next/server';
import { Wallet, WalletTransaction } from '../../../../models/wallet';
import Subscription from '../../../../models/subscription';
import Payment from '../../../../models/payment';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const SUBSCRIPTION_PLANS = {
  '1month': { amount: 1000000, duration: 1 },
  '6months': { amount: 6000000, duration: 6 },
  '1year': { amount: 10000000, duration: 12 }
};

export async function POST(request: NextRequest) {
  try {
    const { plan, storeId } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as { userId?: string, sub?: string, id?: string};
    const userId = decoded.userId || decoded.sub || decoded.id;

    if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Check if user has active subscription with more than 1 month remaining
    const activeSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ endDate: -1 });

    if (activeSubscription) {
      const today = new Date();
      const endDate = new Date(activeSubscription.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 30) {
        return NextResponse.json({ 
          error: 'Active subscription exists',
          message: `شما اشتراک فعال دارید که ${daysRemaining} روز باقی مانده`,
          daysRemaining 
        }, { status: 400 });
      }
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < planDetails.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create payment record
    const planNames = {
      '1month': 'اشتراک یک ماهه',
      '6months': 'اشتراک شش ماهه', 
      '1year': 'اشتراک یک ساله'
    };
    
    const payment = new Payment({
      userId,
      amount: planDetails.amount,
      description: planNames[plan as keyof typeof planNames] || `اشتراک ${plan}`,
      status: 'verified',
      verifiedAt: new Date(),
    });
    await payment.save();

    // Deduct from wallet
    wallet.balance -= planDetails.amount;
    await wallet.save();

    // Create wallet transaction
    const transaction = new WalletTransaction({
      walletId: wallet._id,
      userId,
      paymentId: payment._id,
      type: 'payment',
      amount: planDetails.amount,
      description: planNames[plan as keyof typeof planNames] || `اشتراک ${plan}`,
      status: 'completed',
    });
    await transaction.save();

    // storeId is passed from frontend

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + planDetails.duration);

    const subscription = new Subscription({
      userId,
      storeId,
      plan,
      amount: planDetails.amount,
      startDate,
      endDate,
      status: 'active',
      paymentId: payment._id,
    });
    await subscription.save();

    return NextResponse.json({
      success: true,
      subscription: {
        plan,
        amount: planDetails.amount,
        startDate,
        endDate,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Subscription purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}