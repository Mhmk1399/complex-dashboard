import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";

const jwt = require('jsonwebtoken');

export async function login(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    await connect();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, vendorId: user.vendorId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ message: "Error logging in" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name, email, password, role, vendorId } = await request.json();

  try {
    await connect();

    // Ensure role is valid
    if (!['superadmin', 'vendor', 'user'].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Ensure vendorId is provided for users
    if (role === 'user' && !vendorId) {
      return NextResponse.json({ message: "Vendor ID is required for users" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, vendorId });
    await newUser.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connect();

    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}