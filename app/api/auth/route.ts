import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createWebsite } from "@/utilities/createWebsite";
import deployToVercel from "@/utilities/vercelDeployment";
import { addEnvironmentVariablesToVercel } from "@/utilities/envAdder";
import { createStoreId } from "@/utilities/storeIdCreater";
import { createFolderDisk } from "@/utilities/createFolderDisk"; // Now imports the modified function

export async function POST(request: Request) {
  const {
    phoneNumber,
    password,
    title,
    storeId,
  } = await request.json();

  try {
    await connect();
    
    // Create website using the utility
    console.log("Creating website...");
    const websiteResult = await createWebsite({
      emptyDirectoryRepoUrl: process.env.EMPTY_DIRECTORY_REPO_URL!,
      title,
      storeId,
    });

    if (!websiteResult.success) {
      throw new Error("Failed to create website repository");
    }

    console.log("Website created successfully:", websiteResult);

    // Now call createFolderDisk with the correct parameters
    const folderDiskResult = await createFolderDisk({
      phoneNumber,
      title,
      storeId,
    });

    console.log("folderDiskResult:", folderDiskResult);

    // Check if folder creation was successful
    if (!folderDiskResult.success) {
      throw new Error(folderDiskResult.error || "Failed to create folder disk");
    }

    // Create store ID files
    const storeIdFiles = await createStoreId(storeId, websiteResult.repoUrl);
    console.log("Store ID files created:", storeIdFiles);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Deploy to Vercel
    console.log("Deploying to Vercel...");
    const vercelUrl = await deployToVercel({
      githubRepoUrl: websiteResult.repoUrl,
      reponame: websiteResult.repoName,
    });
    
    console.log("Vercel deployment result:", vercelUrl);

    // Set up environment variables
    const envVariables = [
      { key: 'MONGODB_URI', value: process.env.MONGODB_URI! },
      { key: 'JWT_SECRET', value: process.env.JWT_SECRET! },
      { key: 'NEXT_PUBLIC_API_URL', value: vercelUrl.deploymentUrl },
      { key: "GITHUB_TOKEN", value: process.env.GITHUB_TOKEN! }
    ];
    
    await addEnvironmentVariablesToVercel(vercelUrl.projectId, envVariables);

    // Create clean Vercel URL
    const cleanVercelUrl = `https://${websiteResult.repoName}.vercel.app`;

    // Create new user
    const newUser = new User({
      phoneNumber,
      password: hashedPassword,
      title,
      repoUrl: websiteResult.repoUrl,
      vercelUrl: cleanVercelUrl,
      storeId,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        pass: hashedPassword,
        storeId,
        vercelUrl: cleanVercelUrl,
        repoUrl: websiteResult.repoUrl
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        userId: newUser._id,
        repoUrl: websiteResult.repoUrl,
        vercelUrl: vercelUrl.deploymentUrl,
        websiteLogs: websiteResult.logs,
        folderDiskPath: folderDiskResult.directoryPath, // Include folder disk info
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        message: "Error creating user",
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
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
