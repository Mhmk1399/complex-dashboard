import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createDeployment } from "@/utilities/createNewDeployment";
import { initStore } from "@/utilities/createFolderDisk";

export async function POST(request: NextRequest) {
  const { phoneNumber, password, title, storeId } = await request.json();

  try {
    await connect();

 
// create new deployment
    const createNewDeployment = await createDeployment({
        name: title,
        image: process.env.IMAGE_NAME || "",
        replicas: Number(process.env.REPLICAS) || 2,
        namespace: process.env.NAMESPACE || "",
        storeId
    });

    const deployedUrl = createNewDeployment.config?.host;
    console.log(deployedUrl, " deployment url");


    // create folder in disk
    const createFolderDisk = await initStore(storeId);
  
    const userFolderPath = createFolderDisk.url;
    
  

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      phoneNumber,
      password: hashedPassword,
      title,
      repoUrl: userFolderPath,
      vercelUrl: deployedUrl,
      storeId,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        pass: hashedPassword,
        storeId,
        vercelUrl: deployedUrl,
        repoUrl: userFolderPath,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        userId: newUser._id,
        DiskUrl: createFolderDisk,
        websiteUrl: deployedUrl,
      },
      { status: 201 }
    );
  } catch (error) {

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        message: "Error creating user",
        error: errorMessage,
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
