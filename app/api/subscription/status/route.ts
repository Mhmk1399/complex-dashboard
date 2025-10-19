import { NextRequest, NextResponse } from 'next/server';
import Subscription from '../../../../models/subscription';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as any;
    const userId = decoded.userId || decoded.sub || decoded.id;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const activeSubscription = await Subscription.findOne({
      userId,
      storeId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ endDate: -1 });

    if (activeSubscription) {
      const today = new Date();
      const endDate = new Date(activeSubscription.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return NextResponse.json({
        hasActiveSubscription: true,
        subscription: {
          plan: activeSubscription.plan,
          endDate: activeSubscription.endDate,
          daysRemaining
        }
      });
    }

    return NextResponse.json({
      hasActiveSubscription: false,
      subscription: null
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}