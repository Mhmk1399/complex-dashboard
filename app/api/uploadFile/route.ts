import { NextResponse, NextRequest } from "next/server";
import connect from "@/lib/data";
import Files from "@/models/uploads";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}



export async function POST(request: Request) {
  try {
    await connect();

    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decodedToken: CustomJwtPayload;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "your-jwt-secret") as CustomJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ message: "JWT token expired" }, { status: 401 });
      }
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!decodedToken || !decodedToken.storeId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      console.error("Invalid content-type:", contentType);
      return NextResponse.json({ message: "Invalid content type, expected multipart/form-data" }, { status: 400 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("FormData parsing error:", error);
      return NextResponse.json({ message: "Failed to parse form data" }, { status: 400 });
    }

    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file received" }, { status: 400 });
    }

    // Generate random UUID-based filename
    const extension = file.name.split('.').pop() || 'png';
    const filename = `${uuidv4()}.${extension}`;

    const uploadForm = new FormData();
    uploadForm.append("file", file, filename);
    uploadForm.append("storeId", decodedToken.storeId);

    const flaskResponse = await fetch(`${process.env.VPS_URL}/image/${decodedToken.storeId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VPS_TOKEN}`,
      },
      body: uploadForm,
    });

    const result = await flaskResponse.json();
    if (!flaskResponse.ok) {
      return NextResponse.json({ message: result.error || "VPS upload failed", details: result }, { status: flaskResponse.status });
    }

    const fileUrl = `${process.env.VPS_URL}/image/${decodedToken.storeId}/${filename}`;

    const newFile = new Files({
      fileName: filename, // Store random UUID-based name
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date(),
      storeId: decodedToken.storeId,
    });

    await newFile.save();

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        fileUrl,
        fileDetails: newFile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Upload failed", error: String(error) }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decodedToken: CustomJwtPayload;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "your-jwt-secret") as CustomJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ message: "JWT token expired" }, { status: 401 });
      }
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!decodedToken?.storeId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const flaskUrl = `${process.env.VPS_URL}/image/images/${decodedToken.storeId}`;
    
    const flaskRes = await fetch(flaskUrl, {
      headers: {
        Authorization: `Bearer ${process.env.VPS_TOKEN || "your-secret-token"}`
      }
    });

    if (!flaskRes.ok) {
      return NextResponse.json({ message: "Failed to fetch images from Flask" }, { status: flaskRes.status });
    }

    const data = await flaskRes.json();

    return NextResponse.json({ 
      images: data,
      // storeId: decodedToken.storeId 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching images from Flask:", error);
    return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decodedToken: CustomJwtPayload;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "your-jwt-secret") as CustomJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ message: "JWT token expired" }, { status: 401 });
      }
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { storeId, filename } = await request.json();
    if (!storeId || !filename) {
      return NextResponse.json({ message: "Missing storeId or filename" }, { status: 400 });
    }

    // Optional: Verify storeId matches decoded token
    if (storeId !== decodedToken.storeId) {
      return NextResponse.json({ message: "Invalid storeId" }, { status: 403 });
    }

    const flaskResponse = await fetch(`${process.env.VPS_URL}/image/${storeId}/${filename}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VPS_TOKEN || "your-secret-token"}`,
      }
    });

    const result = await flaskResponse.json();
    if (!flaskResponse.ok) {
      return NextResponse.json({ message: result.error || "Delete failed" }, { status: flaskResponse.status });
    }

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ message: "Delete failed", error: String(error) }, { status: 500 });
  }
}


// function secure_filename(filename: string): string {
//   return filename
//     .replace(/[^a-zA-Z0-9.\-_]/g, "_")
//     .replace(/_{2,}/g, "_")
//     .toLowerCase();
// }
