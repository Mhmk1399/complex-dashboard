import { NextRequest, NextResponse } from 'next/server';
import { Wallet, WalletTransaction } from '../../../../models/wallet';
import Payment from '../../../../models/payment';
import { ZarinPal } from '../../../../lib/zarinpal';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as any;
    const userId = decoded.userId || decoded.sub || decoded.id;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create payment record
    const payment = new Payment({
      userId,
      amount,
      description: 'Wallet Charge',
      status: 'pending',
    });
    await payment.save();

    // Create wallet transaction
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    const transaction = new WalletTransaction({
      walletId: wallet._id,
      userId,
      paymentId: payment._id,
      type: 'charge',
      amount,
      description: 'Wallet Charge',
      status: 'pending',
    });
    await transaction.save();

    // Request payment from Zarinpal
    const callbackUrl = `http://localhost:3000/api/wallet/verify?paymentId=${payment._id}`;
    
    const zarinpalResponse = await ZarinPal.requestPayment({
      amount,
      description: 'شارژ کیف پول',
      callback_url: callbackUrl,
    });

    if (zarinpalResponse.data.code === 100) {
      // Update payment with authority
      payment.authority = zarinpalResponse.data.authority;
      await payment.save();

      const paymentUrl = ZarinPal.getPaymentUrl(zarinpalResponse.data.authority);
      
      return NextResponse.json({
        success: true,
        paymentUrl,
        paymentId: payment._id,
        authority: zarinpalResponse.data.authority,
      });
    } else {
      throw new Error(`Zarinpal error: ${zarinpalResponse.data.message}`);
    }

  } catch (error) {
    console.error('Wallet charge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}