import { NextRequest, NextResponse } from 'next/server';
import Subscription from '../../../../models/subscription';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as any;
    const userId = decoded.userId || decoded.sub || decoded.id;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const subscriptions = await Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .select('plan amount startDate endDate status createdAt');

    return NextResponse.json({ subscriptions });

  } catch (error) {
    console.error('Subscription list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}