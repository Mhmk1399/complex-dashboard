import { NextRequest, NextResponse } from 'next/server';
import { Wallet, WalletTransaction } from '../../../../models/wallet';
import { AIUsage } from '../../../../models/aiUsage';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const TOKEN_PACKAGES = {
  10: { tokens: 10, price: 20000 },
  50: { tokens: 50, price: 100000 },
  100: { tokens: 100, price: 200000 }
};

export async function POST(request: NextRequest) {
  try {
    const { storeId, tokens, amount } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as any;
    const userId = decoded.userId || decoded.sub || decoded.id;

    // Validate token package
    const validPackage = Object.values(TOKEN_PACKAGES).find(
      pkg => pkg.tokens === tokens && pkg.price === amount
    );
    
    if (!validPackage) {
      return NextResponse.json({ error: 'Invalid token package' }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: 'موجودی کیف پول کافی نیست' }, { status: 400 });
    }

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    // Create wallet transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      type: 'payment',
      amount,
      description: `خرید ${tokens} توکن هوش مصنوعی`,
      status: 'completed',
    });

    // Add tokens to AI usage
    let aiUsage = await AIUsage.findOne({ storeId });
    if (!aiUsage) {
      aiUsage = new AIUsage({
        storeId,
        totalTokens: tokens,
        usedTokens: 0,
        remainingTokens: tokens,
        usageHistory: []
      });
    } else {
      aiUsage.totalTokens += tokens;
      aiUsage.remainingTokens += tokens;
    }
    await aiUsage.save();

    return NextResponse.json({
      success: true,
      tokens,
      amount,
      newBalance: wallet.balance
    });

  } catch (error) {
    console.error('Token purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}