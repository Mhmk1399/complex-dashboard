import { initStore } from "@/utilities/createFolderDisk"; // Assume this handles file system logic
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("storeId");
    console.log(storeId, "storeId");
    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId in header" }, { status: 400 });
    }

    const response = await initStore(storeId);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}