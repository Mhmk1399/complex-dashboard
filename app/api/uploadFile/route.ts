import { NextResponse } from "next/server";
import connect from "@/lib/data";
import { writeFile } from "fs/promises";
import { join } from "path";
import Files from "@/models/uploads";
import jwt, { JwtPayload } from "jsonwebtoken";

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
        // const verifiedtoken = jwt.verify(token, process.env.JWT_SECRET!);
        // if (!verifiedtoken) {
        //     return NextResponse.json(
        //         { message: "Unauthorized" },
        //         { status: 401 }
        //     );
        // }
        const decodedToken = jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }
        const targetDirectory = decodedToken.targetDirectory;
        const uploadsDir = join(targetDirectory, "public", "uploads");

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { message: "No file received" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory path

        const filePath = join(uploadsDir);

        // Save file to directory
        console.log(filePath);
        
        await writeFile(filePath, buffer);

        // Create file URL
        const fileUrl = `//Users//macbook//Desktop//mohammad//public//assets//images//${file.name}`;

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
            { message: "Error uploading file" },
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