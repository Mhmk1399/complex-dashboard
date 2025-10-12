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
      return NextResponse.json({ message: 'فرمت شماره تلفن صحیح نیست' }, { status: 400 });
    }

    await connect();

    const user = await User.findOne({ phoneNumber });
    
    if (user) {
      return NextResponse.json({ message: 'این شماره تلفن قبلاً ثبت شده است' }, { status: 409 });
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
      return NextResponse.json({ message: 'خطا در ارسال پیامک ثبت نام' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'کد تایید برای ثبت نام ارسال شد',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Send register code error:', error);
    return NextResponse.json({ message: 'خطای سرور در ثبت نام' }, { status: 500 });
  }
}