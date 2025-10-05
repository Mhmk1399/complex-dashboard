import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Jsons from "@/models/jsons";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const data = await request.json();

    const result = await Jsons.findOneAndUpdate(
      { storeId: data.storeId, route: data.route },
      {
        storeId: data.storeId,
        route: data.route,
        lgContent: data.lgContent,
        smContent: data.smContent,
        version: data.version || "1",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      id: result._id,
      message: "Data saved successfully",
    });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
