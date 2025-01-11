import connect from "@/lib/data";
import { NextResponse } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createWebsite } from "../createWebsite/route";

export async function POST(request: Request) {
  const {
    name,
    phoneNumber,
    password,
    title,
    subdomain,
    location,
    socialMedia,
    category,
    targetProjectDirectory,
    templatesDirectory,
    emptyDirectory,
    storeId,
  } = await request.json();

  try {
    await connect();

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      phoneNumber,
      password: hashedPassword,
      title,
      subdomain,
      location,
      socialMedia,
      category,
      targetProjectDirectory,
      templatesDirectory,
      emptyDirectory,
      storeId,
    });

    await newUser.save();

    const token = jwt.sign(
      { 
        id: newUser._id,
        pass: hashedPassword,
        targetDirectory: targetProjectDirectory,
        templatesDirectory,
        emptyDirectory,
        storeId
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const websiteResult = await createWebsite({
      emptyDirectory,
      targetDirectory: targetProjectDirectory,
      storeId,
    });

    return NextResponse.json(
      { 
        message: "User created successfully",
        token,
        userId: newUser._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
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
