import connect from "@/lib/data";
import { NextResponse } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createWebsite } from "@/utilities/createWebsite";
import deployToVercel from "@/utilities/vercelDeployment";
import { addEnvironmentVariablesToVercel } from "@/utilities/envAdder";
import { createStoreId } from "@/utilities/storeIdCreater";

export async function POST(request: Request) {
  const {
    phoneNumber,
    password,
    title,
    storeId,
  } = await request.json();

  try {
    await connect();
    const websiteResult = await createWebsite({
      emptyDirectoryRepoUrl: process.env.EMPTY_DIRECTORY_REPO_URL!,
      title,
      storeId,
    });

    console.log("websiteResult:", websiteResult);

    const storeIdFiles = await createStoreId(storeId, websiteResult.repoUrl);
    console.log("Store ID files created:", storeIdFiles);


    //create website

    const hashedPassword = await bcrypt.hash(password, 10);
    const vercelUrl = await deployToVercel({
      githubRepoUrl: websiteResult.repoUrl,
      reponame: websiteResult.repoName,
    });
    console.log("websiteResult:", websiteResult);
    console.log("vercelUrl:", vercelUrl);
    const envVariables = [
      { key: 'MONGODB_URI', value: process.env.MONGODB_URI! },
      { key: 'JWT_SECRET', value: process.env.JWT_SECRET! },
      { key: 'NEXT_PUBLIC_API_URL', value: vercelUrl.deploymentUrl },
      { key: "GITHUB_TOKEN", value: process.env.GITHUB_TOKEN! }]
      ;
    await addEnvironmentVariablesToVercel(vercelUrl.projectId, envVariables);


    const repoUrl = websiteResult.repoUrl;
    console.log("repoUrl:", repoUrl);

    const newUser = new User({
      phoneNumber,
      password: hashedPassword,
      title,
      repoUrl,
      vercelUrl: vercelUrl.deploymentUrl,
      storeId,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        pass: hashedPassword,
        storeId,
        vercelUrl: vercelUrl.deploymentUrl,
        repoUrl
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
        // Also return it in the response
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
