import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/users';
import Verification from '@/models/verification';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, lastName, password, phone } = await request.json();

    if (!name || !lastName || !password || !phone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    await dbConnect();

    const verification = await Verification.findOne({ phone, verified: true });
    if (!verification) {
      return NextResponse.json({ error: 'Phone not verified' }, { status: 400 });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      lastName,
      email: `${phone}@temp.com`,
      password: hashedPassword,
      phone
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    console.log(_)
    return NextResponse.json({
      token,
      user: userWithoutPassword
    }, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}