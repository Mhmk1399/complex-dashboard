import { NextResponse } from "next/server";
import connect from "@/lib/data";
import Files from "@/models/uploads";
import jwt, { JwtPayload } from "jsonwebtoken";
import { deleteGitHubFile, saveGitHubMedia } from "@/utilities/github";

interface CustomJwtPayload extends JwtPayload {
    targetDirectory: string;
    storeId: string;
}

export async function POST(request: Request) {
    try {
        await connect();
        if (!connect) {
            return NextResponse.json(
                { message: "Database connection error" },
                { status: 500 }
            );
        }

        // Get the token from the request headers
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decodedToken = jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { message: "No file received" },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = buffer.toString('base64');

        // Construct GitHub file path
        const filePath = `images/${file.name}`;

        // Upload file to GitHub and get download URL
        const fileUrl = await saveGitHubMedia(
            filePath,
            base64File,
            `Upload ${file.name}`
          );
          

        // Save file info to MongoDB
        const newFile = new Files({
            fileName: file.name,
            fileUrl: fileUrl,
            fileType: file.type,
            fileSize: file.size,
            uploadDate: new Date(),
            storeId: decodedToken.storeId
        });

        await newFile.save();

        return NextResponse.json(
            {
                message: "File uploaded successfully",
                fileUrl: fileUrl,
                fileDetails: newFile
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { message: "Error uploading file", error: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    await connect();
    if (!connect) {
        return NextResponse.json(
            { message: "Database connection error" },
            { status: 500 }
        );
    }

    const files = await Files.find();
    return NextResponse.json(files, { status: 200 });
}

export async function DELETE(request: Request) {
    try {
        await connect();
        if (!connect) {
            return NextResponse.json(
                { message: "Database connection error" },
                { status: 500 }
            );
        }

        // Extract file ID from the request
        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get('id');

        if (!fileId) {
            return NextResponse.json(
                { message: "File ID is required" },
                { status: 400 }
            );
        }

        // Find the file in the database
        const file = await Files.findById(fileId);
        
        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        // Extract the file path from the GitHub URL
        const filePath = file.fileUrl.split('com/Mhmk1399/userwebsite/main/')[1];

        // Delete from GitHub
        await deleteGitHubFile(filePath);

        // Delete from MongoDB
        await Files.findByIdAndDelete(fileId);

        return NextResponse.json(
            { message: "File deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { message: "Error deleting file", error: String(error) },
            { status: 500 }
        );
    }
}