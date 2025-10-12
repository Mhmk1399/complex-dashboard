import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createIngress } from "@/utilities/createNewIngress";


export async function POST(request: NextRequest) {
  
  const { phoneNumber, password, title, storeId } = await request.json();

  try {
    await connect();

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const createNewDeployment = await createIngress({
      namespace: process.env.NAMESPACE || "mamad",
      storeId,
    });

    const DeployedUrl = createNewDeployment.config?.host;
    if (!DeployedUrl) throw new Error("Deployment URL missing");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phoneNumber,
      password: hashedPassword,
      title,
      DeployedUrl,
      storeId,
      trialDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        storeId,
        DeployedUrl,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        userId: newUser._id,
        websiteUrl: DeployedUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
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
