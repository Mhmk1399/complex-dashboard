import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/data';
import User from '@/models/users';
import Verification from '@/models/verification';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, newPassword } = await request.json();

    if (!phoneNumber || !code || !newPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connect();

    // Find the verification record (it should be verified from previous step)
    const verification = await Verification.findOne({ 
      phone: phoneNumber, 
      code,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json({ message: 'کد نامعتبر است' }, { status: 400 });
    }

    // Find user and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Mark verification as used
    await Verification.findByIdAndUpdate(verification._id, { verified: true });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}