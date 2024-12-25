import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import StoreUsers from "@/models/storesUsers";
import Jwt, { JwtPayload } from "jsonwebtoken";



interface CustomJwtPayload extends JwtPayload {
    targetDirectory: string;
    storeId: string;
}



export async function GET(res: NextResponse, request: NextRequest) {
    await connect();
    if (!connect)
        return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        const sotreId = decodedToken.storeId;
        if (!sotreId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }


        const users = await StoreUsers.find({ storeId: sotreId });
        return NextResponse.json({ users }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}