import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";

import NwesLetter from "@/models/newsLetter";

export async function GET() {
  try {
    await connect();
    const newsletters = await NwesLetter.find({});
    return NextResponse.json(newsletters);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { storeId, phoneNumber } = await request.json();
    
    const newsletter = new NwesLetter({ storeId, phoneNumber });
    await newsletter.save();
    
    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to create newsletter" }, { status: 500 });
  }
}