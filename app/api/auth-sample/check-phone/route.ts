import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/users';

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

    const existingUser = await User.findOne({ phone });
    
    return NextResponse.json({ 
      userExists: !!existingUser,
      action: existingUser ? 'login' : 'register'
    });
  } catch (error) {
    console.error('Check phone error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}