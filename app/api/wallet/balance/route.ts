import { NextRequest, NextResponse } from 'next/server';
import { Wallet } from '../../../../models/wallet';
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

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    return NextResponse.json({
      balance: wallet.balance,
      currency: wallet.currency,
    });

  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}