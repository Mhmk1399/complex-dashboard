import { NextRequest, NextResponse } from 'next/server';
import { Wallet, WalletTransaction } from '../../../../models/wallet';
import Payment from '../../../../models/payment';
import { ZarinPal } from '../../../../lib/zarinpal';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');
    const paymentId = searchParams.get('paymentId');

    if (!authority || !paymentId) {
      return NextResponse.redirect(new URL('/wallet/verify?status=failed', request.url));
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.redirect(new URL('/wallet/verify?status=failed', request.url));
    }

    if (status === 'OK') {
      // Verify payment with Zarinpal
      const verifyResponse = await ZarinPal.verifyPayment({
        amount: payment.amount,
        authority,
      });

      if (verifyResponse.data.code === 100 || verifyResponse.data.code === 101) {
        // Payment successful
        payment.status = 'verified';
        payment.refId = verifyResponse.data.ref_id;
        payment.cardPan = verifyResponse.data.card_pan;
        payment.cardHash = verifyResponse.data.card_hash;
        payment.verifiedAt = new Date();
        await payment.save();

        // Update wallet transaction and balance
        const transaction = await WalletTransaction.findOne({ paymentId });
        if (transaction) {
          transaction.status = 'completed';
          await transaction.save();

          const wallet = await Wallet.findById(transaction.walletId);
          if (wallet) {
            // Fix balance if it's not a number
            if (typeof wallet.balance !== 'number') {
              wallet.balance = 0;
            }
            wallet.balance += transaction.amount;
            await wallet.save();
          }
        }

        return NextResponse.redirect(new URL('/wallet/verify?status=success', request.url));
      } else {
        payment.status = 'failed';
        await payment.save();
        return NextResponse.redirect(new URL('/wallet/verify?status=failed', request.url));
      }
    } else {
      payment.status = 'cancelled';
      await payment.save();
      return NextResponse.redirect(new URL('/wallet/verify?status=failed', request.url));
    }

  } catch (error) {
    console.error('Wallet verify error:', error);
    return NextResponse.redirect(new URL('/wallet/verify?status=failed', request.url));
  }
}