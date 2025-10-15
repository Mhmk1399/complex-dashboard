import Enamad from "@/models/enamad";
import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import jwt, { JwtPayload } from "jsonwebtoken";
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
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = jwt.decode(token) as CustomJwtPayload;
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const storeId = decodedToken.storeId;
    console.log("storeId", storeId);

    const enamads = await Enamad.find({ storeId: storeId });
    return NextResponse.json(enamads);
  } catch (error) {
    console.log("Error fetching enamads:", error);
    return NextResponse.json({ error: "Failed to fetch enamads" });
  }
}
export async function POST(req: NextRequest) {
  try {
    await connect();
    console.log("Connected to MongoDB");
    if (!connect) {
      return NextResponse.json({ error: "Failed to connect to database" });
    }
    const token = req.headers.get("Authorization");
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
    const body = await req.json();
    const tag = body.tag;
    const link = body.link;


    if (!tag) {
      return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
    }
    if (!link) {
      return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    }

    const enamad = new Enamad({
      tag,
      link,
      storeId,
    });
    await enamad.save();
    return NextResponse.json(enamad);
  } catch (error) {
    console.log("Error creating enamad:", error);
    return NextResponse.json({ error: "Failed to create enamad" });
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
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
    }
    const enamad = await Enamad.findOneAndDelete({ _id: id });

    if (!enamad) {
      return NextResponse.json({ error: "Enamad not found" }, { status: 404 });
    }
    return NextResponse.json(enamad);
  } catch (error) {
    console.log("Error deleting enamad:", error);
    return NextResponse.json({ error: "Failed to delete enamad" });
  }
}
