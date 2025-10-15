import { NextRequest, NextResponse } from "next/server";
import  connect  from "@/lib/data";
import { AIUsage } from "@/models/aiUsage";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    let usage = await AIUsage.findOne({ storeId });
    
    // Create default usage if doesn't exist
    if (!usage) {
      usage = new AIUsage({ storeId });
      await usage.save();
    }

    return NextResponse.json({
      totalTokens: usage.totalTokens,
      usedTokens: usage.usedTokens,
      remainingTokens: usage.remainingTokens,
      lastUsed: usage.lastUsed,
      usageHistory: usage.usageHistory.slice(-10) // Last 10 usage records
    });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { storeId, tokensToAdd } = await request.json();
    
    if (!storeId || !tokensToAdd || tokensToAdd <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    let usage = await AIUsage.findOne({ storeId });
    
    if (!usage) {
      usage = new AIUsage({ storeId });
    }
    
    usage.totalTokens += tokensToAdd;
    usage.remainingTokens = usage.totalTokens - usage.usedTokens;
    await usage.save();

    return NextResponse.json({
      message: "Tokens added successfully",
      totalTokens: usage.totalTokens,
      remainingTokens: usage.remainingTokens
    });
  } catch (error) {
    console.error("Error adding tokens:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}