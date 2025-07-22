import { NextResponse, NextRequest } from "next/server";
import connect from "@/lib/data";
import Files from "@/models/uploads";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}

const VPS_TOKEN = process.env.VPS_TOKEN || "your-secret-token";
const VPS_URL = process.env.VPS_URL || "mamad";
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";

const verifyToken = (token: string | null): CustomJwtPayload | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
  } catch (error) {
    return null;
  }
};

export const uploadFile = async (request: Request) => {
  try {
    await connect();
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const decodedToken = verifyToken(token || "");
    if (!decodedToken || !decodedToken.storeId) {
      return NextResponse.json({ message: "Unauthorized or invalid token" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json({ message: "Invalid content type" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file received" }, { status: 400 });
    }

    const extension = file.name.split(".").pop() || "png";
    const filename = `${uuidv4()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileBlob = new Blob([buffer], { type: file.type });

    const uploadForm = new FormData();
    uploadForm.append("file", fileBlob, filename);
    uploadForm.append("storeId", decodedToken.storeId);

    const flaskResponse = await fetch(`${VPS_URL}/upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${VPS_TOKEN}` },
      body: uploadForm,
    });

    const result = await flaskResponse.json();
    if (!flaskResponse.ok) {
      return NextResponse.json({ message: result.error || "VPS upload failed" }, { status: flaskResponse.status });
    }

    const fileUrl = `${VPS_URL}/uploads/${decodedToken.storeId}/image/${filename}`;
    const newFile = new Files({
      fileName: filename,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date(),
      storeId: decodedToken.storeId,
    });

    await newFile.save();
    return NextResponse.json({ message: "File uploaded successfully", fileUrl, fileDetails: newFile }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Upload failed", error: String(error) }, { status: 500 });
  }
};

export const fetchFiles = async (request: NextRequest) => {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const decodedToken = verifyToken(token || "");
    if (!decodedToken || !decodedToken.storeId) {
      return NextResponse.json({ message: "Unauthorized or invalid token" }, { status: 401 });
    }

    const flaskUrl = `${VPS_URL}/images/${decodedToken.storeId}`;
    const flaskRes = await fetch(flaskUrl, {
      headers: { Authorization: `Bearer ${VPS_TOKEN}` },
    });

    if (!flaskRes.ok) {
      return NextResponse.json({ message: "Failed to fetch images" }, { status: flaskRes.status });
    }

    const data = await flaskRes.json();
    return NextResponse.json({ images: data.images, storeId: decodedToken.storeId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Fetch failed", error: String(error) }, { status: 500 });
  }
};

export const deleteFile = async (request: NextRequest) => {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const decodedToken = verifyToken(token || "");
    if (!decodedToken || !decodedToken.storeId) {
      return NextResponse.json({ message: "Unauthorized or invalid token" }, { status: 401 });
    }

    const { storeId, filename } = await request.json();
    if (!storeId || !filename) {
      return NextResponse.json({ message: "Missing storeId or filename" }, { status: 400 });
    }

    if (storeId !== decodedToken.storeId) {
      return NextResponse.json({ message: "Invalid storeId" }, { status: 403 });
    }

    const flaskResponse = await fetch(`${VPS_URL}/delete/image`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VPS_TOKEN}`,
      },
      body: JSON.stringify({ storeId, filename }),
    });

    const result = await flaskResponse.json();
    if (!flaskResponse.ok) {
      return NextResponse.json({ message: result.error || "Delete failed" }, { status: flaskResponse.status });
    }

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Delete failed", error: String(error) }, { status: 500 });
  }
};