import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import StoreUsers from "@/models/storesUsers";
import Jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
    storeId: string;
}

export async function GET(res: NextResponse, request: NextRequest) {
    await connect();
    if (!connect)
        return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    try {
        const params = request.nextUrl.searchParams;
        const id = params.get('id');
        if (!id) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 })
        }
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const sotreId = decodedToken.storeId;
        if (!sotreId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const user = await StoreUsers.findOne({ _id: id, storeId: sotreId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
export async function DELETE(res: NextResponse, request: NextRequest) {
    await connect();
    if (!connect)
        return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    try {
        const params = request.nextUrl.searchParams;
        const id = params.get('id');
        if (!id) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 })
        }
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const sotreId = decodedToken.storeId;
        if (!sotreId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const user = await StoreUsers.findByIdAndDelete({ _id: id, storeId: sotreId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
export async function PATCH(res: NextResponse, request: NextRequest) {
    await connect();
    if (!connect)
        return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    try {
        const params = request.nextUrl.searchParams;
        const id = params.get('id');
        if (!id) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 })
        }
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const sotreId = decodedToken.storeId;
        if (!sotreId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const user = await StoreUsers.findByIdAndUpdate({ _id: id, storeId: sotreId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "User updated successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
