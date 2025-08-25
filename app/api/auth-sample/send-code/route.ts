import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Verification from '@/models/verification';
import { sendVerificationCode, generateVerificationCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'شماره تلفن الزامی است' }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'فرمت شماره تلفن صحیح نیست' }, { status: 400 });
    }

    await dbConnect();

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Verification.findOneAndUpdate(
      { phone },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );
    
    const sent = await sendVerificationCode(phone, code);

    if (!sent) {
      return NextResponse.json({ error: 'خطا در ارسال پیامک' }, { status: 500 });
    }

    return NextResponse.json({ message: 'کد تایید ارسال شد' });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}