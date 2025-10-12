import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/data';
import Verification from '@/models/verification';
import User from '@/models/users';
import { sendVerificationCode, generateVerificationCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: 'شماره تلفن الزامی است' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'فرمت شماره تلفن نامعتبر است' }, { status: 400 });
    }

    await connect();

    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return NextResponse.json({ message: 'کاربری با این شماره تلفن یافت نشد' }, { status: 404 });
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    await Verification.findOneAndUpdate(
      { phone: phoneNumber },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );
    
    const sent = await sendVerificationCode(phoneNumber, code);

    if (!sent) {
      return NextResponse.json({ message: 'خطا در ارسال کد تایید' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'کد تایید برای ورود ارسال شد',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Send login code error:', error);
    return NextResponse.json({ message: 'خطای سرور در ورود' }, { status: 500 });
  }
}