import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; storeId: string; type: string; iat: number; exp: number; id:string; userId:string}
    
    // Generate short-lived redirect token (5 minutes)
    const redirectToken = jwt.sign(
      {
        userId: decoded.sub || decoded.userId || decoded.id,
        storeId: decoded.storeId,
        type: "redirect"
      },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );

    return NextResponse.json({ redirectToken });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}