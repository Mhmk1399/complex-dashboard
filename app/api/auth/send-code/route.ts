import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/data';
import Verification from '@/models/verification';
import { sendVerificationCode, generateVerificationCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    await connect();

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    await Verification.findOneAndUpdate(
      { phone: phoneNumber },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );
    
    const sent = await sendVerificationCode(phoneNumber, code);

    if (!sent) {
      return NextResponse.json({ message: 'Failed to send SMS' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Verification code sent',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}