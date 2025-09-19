import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import UserInfo from "@/models/userInfo";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  storeId?: string;
}

export async function POST(request: Request) {
  try {
    await connect();
    
    const token = request.headers.get("Authorization")?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decodedToken = jwt.decode(token) as CustomJwtPayload;
    
    if (!decodedToken || !decodedToken.storeId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const userInfoData = await request.json();
    
    const existingUserInfo = await UserInfo.findOne({ storeId: decodedToken.storeId });
    
    if (existingUserInfo) {
      const mergedData = {
        basic: { ...existingUserInfo.basic, ...userInfoData.basic },
        design: { ...existingUserInfo.design, ...userInfoData.design },
        contact: { ...existingUserInfo.contact, ...userInfoData.contact },
        social: { ...existingUserInfo.social, ...userInfoData.social },
        storeId: decodedToken.storeId
      };
      const updatedUserInfo = await UserInfo.findOneAndUpdate(
        { storeId: decodedToken.storeId },
        mergedData,
        { new: true }
      );
      return NextResponse.json(
        { message: "User info updated successfully", userInfo: updatedUserInfo },
        { status: 200 }
      );
    } else {
      const newUserInfo = new UserInfo({
        ...userInfoData,
        storeId: decodedToken.storeId
      });
      await newUserInfo.save();
      return NextResponse.json(
        { message: "User info created successfully", userInfo: newUserInfo },
        { status: 201 }
      );
    }
  } catch (error) {
    console.log("Error saving user info:", error);
    return NextResponse.json(
      { message: "Error saving user info", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decodedToken = jwt.decode(token) as CustomJwtPayload;
    
    if (!decodedToken || !decodedToken.storeId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const userInfo = await UserInfo.findOne({ storeId: decodedToken.storeId });
    
    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 });
    }
    
    return NextResponse.json({ userInfo }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { message: "Error fetching user info" },
      { status: 500 }
    );
  }
}