import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createDeployment } from "@/utilities/createNewDeployment";
import { initStore } from "@/utilities/createFolderDisk";

export async function POST(request: NextRequest) {
  console.log("Signup API hit");
  const { phoneNumber, password, title, storeId } = await request.json();

  try {
    await connect();
    console.log("Connected to DB");

    console.log("Starting deployment creation...");
    const createNewDeployment = await createDeployment({
      name: `${title}-${storeId}`,
      image: process.env.IMAGE_NAME || "",
      replicas: Number(process.env.REPLICAS) || 2,
      namespace: process.env.NAMESPACE || "",
      storeId,
    });
    console.log("Deployment created:", createNewDeployment);

    const DeployedUrl = createNewDeployment.config?.host;
    if (!DeployedUrl) throw new Error("Deployment URL missing");

    console.log("Starting folder creation...");
    const createFolderDisk = await initStore(storeId);
    const DiskUrl = createFolderDisk.url;
    if (!DiskUrl) throw new Error("Disk URL missing");

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new user...");
    const newUser = new User({
      phoneNumber,
      password: hashedPassword,
      title,
      DiskUrl,
      DeployedUrl,
      storeId,
      trialDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // or a full week if you're testing login too
    });

    await newUser.save();
    console.log("User saved to DB");

    const token = jwt.sign(
      {
        id: newUser._id,
        storeId,
        DeployedUrl,
        DiskUrl,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    console.log("Signup successful");
    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        userId: newUser._id,
        DiskUrl,
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
