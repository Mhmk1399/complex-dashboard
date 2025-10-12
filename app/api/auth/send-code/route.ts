import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/data';
import Verification from '@/models/verification';
import User from '@/models/users';
import { sendVerificationCode, generateVerificationCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, action } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: 'شماره تلفن الزامی است' }, { status: 400 });
    }

    if (!action || !['login', 'register'].includes(action)) {
      return NextResponse.json({ message: 'عملیات باید ورود یا ثبت نام باشد' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'فرمت شماره تلفن نامعتبر است' }, { status: 400 });
    }

    await connect();

    const user = await User.findOne({ phoneNumber });
    
    if (action === 'login' && !user) {
      return NextResponse.json({ message: 'کاربری با این شماره تلفن ثبت نشده است' }, { status: 404 });
    }
    
    if (action === 'register' && user) {
      return NextResponse.json({ message: 'کاربری با این شماره تلفن قبلاً ثبت شده است' }, { status: 409 });
    }

    // Rate limiting: Check if code was sent recently
    // const existingVerification = await Verification.findOne({ phone: phoneNumber });
    // if (existingVerification && existingVerification.expiresAt > new Date()) {
    //   return NextResponse.json({ 
    //     message: 'Code already sent. Please wait before requesting again.',
    //     expiresAt: existingVerification.expiresAt.toISOString()
    //   }, { status: 429 });
    // }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    await Verification.findOneAndUpdate(
      { phone: phoneNumber },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );
    
    const sent = await sendVerificationCode(phoneNumber, code);

    if (!sent) {
      return NextResponse.json({ message: 'ارسال پیامک با خطا مواجه شد' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'کد تایید ارسال شد',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ message: 'خطای سرور' }, { status: 500 });
  }
}