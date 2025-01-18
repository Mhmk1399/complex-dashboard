import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import StoreUsers from "@/models/storesUsers";
import Jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
    storeId: string;
}

export async function GET(req: NextRequest) {
    await connect();
    if (!connect) {
        return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    try {
        const id = req.nextUrl.pathname.split('/')[3];
        if (!id) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const storeId = decodedToken.storeId;
        if (!storeId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await StoreUsers.findOne({ _id: id, storeId: storeId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await connect();
    if (!connect) {
        return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    try {
        const id = req.nextUrl.pathname.split('/')[3];
        if (!id) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const storeId = decodedToken.storeId;
        if (!storeId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await StoreUsers.findByIdAndDelete({ _id: id, storeId: storeId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    await connect();
    if (!connect) {
        return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    try {
        const id = req.nextUrl.pathname.split('/')[3];
        if (!id) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        if (!decodedToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const storeId = decodedToken.storeId;
        if (!storeId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const updatedUser = await StoreUsers.findOneAndUpdate(
            { _id: id, storeId: storeId },
            body,
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
