import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/data';
import Verification from '@/models/verification';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json({ message: 'Phone number and code are required' }, { status: 400 });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ message: 'کد باید ۶ رقمی باشد' }, { status: 400 });
    }

    await connect();

    const verification = await Verification.findOne({ 
      phone: phoneNumber, 
      code,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json({ message: 'کد نامعتبر است' }, { status: 400 });
    }

    verification.verified = true;
    verification.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await verification.save();

    return NextResponse.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.log('Verify code error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}