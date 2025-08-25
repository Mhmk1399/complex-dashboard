import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/users";
import Verification from "@/models/verification";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password required" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const verification = await Verification.findOne({ phone, verified: true });
    if (!verification) {
      return NextResponse.json({ error: 'Phone not verified' }, { status: 400 });
    }
    
    const user = await User.findOne({ phone });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" + error },
      { status: 500 }
    );
  }
}
