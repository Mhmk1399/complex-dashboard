import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import { AIUsage } from "@/models/aiUsage";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { storeId, tokensUsed, feature, prompt } = await request.json();
    
    if (!storeId || !tokensUsed || !feature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const usage = await AIUsage.findOne({ storeId });
    
    if (!usage) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (usage.remainingTokens < tokensUsed) {
      return NextResponse.json({ 
        error: "Insufficient tokens",
        remainingTokens: usage.remainingTokens,
        requiredTokens: tokensUsed
      }, { status: 402 });
    }

    // Consume tokens
    usage.usedTokens += tokensUsed;
    usage.remainingTokens = usage.totalTokens - usage.usedTokens;
    usage.lastUsed = new Date();
    usage.usageHistory.push({
      tokensUsed,
      feature,
      prompt: prompt?.substring(0, 500)
    });

    await usage.save();

    return NextResponse.json({
      success: true,
      remainingTokens: usage.remainingTokens,
      usedTokens: usage.usedTokens
    });
  } catch (error) {
    console.error("Error consuming tokens:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}