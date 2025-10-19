import { NextRequest, NextResponse } from 'next/server';
import { WalletTransaction } from '../../../../models/wallet';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as { userId?: string, sub?: string, id?: string};
    const userId = decoded.userId || decoded.sub || decoded.id;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('type amount description status createdAt');

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Wallet transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}