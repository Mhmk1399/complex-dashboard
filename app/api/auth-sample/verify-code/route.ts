import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Verification from '@/models/verification';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'شماره تلفن و کد الزامی است' }, { status: 400 });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'کد تایید باید 6 رقم باشد' }, { status: 400 });
    }

    await dbConnect();

    const verification = await Verification.findOne({ 
      phone, 
      code,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json({ error: 'کد نامعتبر یا منقضی شده' }, { status: 400 });
    }

    verification.verified = true;
    await verification.save();

    return NextResponse.json({ message: 'کد با موفقیت تایید شد' });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}