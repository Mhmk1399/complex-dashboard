import connect from "@/lib/data";
import { NextResponse } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createWebsite } from "@/utilities/createWebsite";

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

    //creaete website
    const websiteResult = await createWebsite({
      emptyDirectoryRepoUrl: process.env.EMPTY_DIRECTORY_REPO_URL!,
      targetDirectory: targetProjectDirectory,
      storeId,
    });
    
    const token = jwt.sign(
      {
        id: newUser._id,
        pass: hashedPassword,
        targetDirectory: targetProjectDirectory,
        templatesDirectory,
        emptyDirectory,
        storeId,
        repoUrl: websiteResult.repoUrl // Add the repo URL to the token
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
  
    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        userId: newUser._id,
        repoUrl: websiteResult.repoUrl // Also return it in the response
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
