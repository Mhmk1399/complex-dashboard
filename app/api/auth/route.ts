import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
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

    console.log("User created successfully");
   
    try {
      const websiteResult = await createWebsite({
        emptyDirectory: emptyDirectory as string,
        targetDirectory: targetProjectDirectory as string

      });
      websiteResult
      console.log("Website created successfully");
      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
      );
    } catch (error) {
      console.error("error creating website:", error);
      return NextResponse.json(
        { message: "error creating website"},
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
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
