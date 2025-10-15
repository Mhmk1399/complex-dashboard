import Story from "../../../models/story";
import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import jwt, { JwtPayload } from 'jsonwebtoken'
interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}
export async function GET(req: NextRequest) {
  try {
    await connect();
    console.log("Connected to MongoDB");
    if (!connect) {
      return NextResponse.json({ error: "Failed to connect to database" });
    }
    const token = req.headers.get("Authorization")?.split(" ")[1]

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = jwt.decode(token) as CustomJwtPayload
    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const storeId = decodedToken.storeId
    if (!storeId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    const stories = await Story.find({ storeId: storeId });
    return NextResponse.json(stories);
  } catch (error) {
    console.log("Error fetching stories:", error);
    return NextResponse.json({ error: "Failed to fetch stories" });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connect();
    console.log("Connected to MongoDB");
    if (!connect) {
      return NextResponse.json({ error: "Failed to connect to database" });
    }
    const token = req.headers.get("Authorization")

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = jwt.decode(token) as CustomJwtPayload
    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const storeId = decodedToken.storeId
    if (!storeId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    const body = await req.json();
    const story = new Story({
      storeId,
      ...body
    });
    await story.save();
    return NextResponse.json({ message: "Story created successfully" }, { status: 201 });
  } catch (error) {
    console.log("Error creating story:", error);
    return NextResponse.json({ error: "Failed to create story" });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    await connect();
    console.log("Connected to MongoDB");
    if (!connect) {
      return NextResponse.json({ error: "Failed to connect to database" });
    }
    const body = await req.json();
    const result = await Story.findByIdAndUpdate(body._id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.log("Error updating story:", error);
    return NextResponse.json({ error: "Failed to update story" });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    await connect();
    console.log("Connected to MongoDB");
    if (!connect) {
      return NextResponse.json({ error: "Failed to connect to database" });
    }
    const body = await req.json();
    const result = await Story.findByIdAndDelete(body._id);
    return NextResponse.json(result);
  } catch (error) {
    console.log("Error deleting story:", error);
    return NextResponse.json({ error: "Failed to delete story" });
  }
}