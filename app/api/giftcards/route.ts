import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import GiftCard from "@/models/giftCard";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  storeId?: string;
}

export async function POST(request: Request) {
  const giftCardData = await request.json();

  try {
    await connect();
    
    const token = request.headers.get("Authorization")?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decodedToken = jwt.decode(token) as CustomJwtPayload;
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const newGiftCard = new GiftCard(giftCardData);
    await newGiftCard.save();
    
    return NextResponse.json(
      { message: "Gift card created successfully", giftCard: newGiftCard },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating gift card", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await connect();
  
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token) as CustomJwtPayload;
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const storeId = decodedToken.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const giftCards = await GiftCard.find({ storeId });
    return NextResponse.json({ giftCards }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Error fetching gift cards" },
      { status: 500 }
    );
  }
}