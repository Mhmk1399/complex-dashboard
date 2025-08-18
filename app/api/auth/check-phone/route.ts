import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/data';
import User from '@/models/users';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await connect();

    const user = await User.findOne({ phoneNumber });

    return NextResponse.json({ 
      exists: !!user,
      action: user ? 'login' : 'signup'
    });
  } catch (error) {
    console.error('Check phone error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}