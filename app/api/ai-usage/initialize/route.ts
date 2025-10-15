import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import { AIUsage } from "@/models/aiUsage";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { storeId } = await request.json();
    
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    // Check if usage record already exists
    const existingUsage = await AIUsage.findOne({ storeId });
    
    if (existingUsage) {
      return NextResponse.json({ 
        message: "Usage record already exists",
        usage: existingUsage
      });
    }

    // Create new usage record with default tokens
    const newUsage = new AIUsage({ 
      storeId,
      totalTokens: 1000,
      usedTokens: 0,
      remainingTokens: 1000
    });
    
    await newUsage.save();

    return NextResponse.json({
      message: "AI usage initialized successfully",
      usage: newUsage
    });
  } catch (error) {
    console.error("Error initializing AI usage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}