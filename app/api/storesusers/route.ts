import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import StoreUsers from "@/models/storesUsers";
import Jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
    targetDirectory: string;
    storeId: string;
}

export async function GET(request: NextRequest) {
    connect();
    if(!connect){
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }

    try {
        const token = request.headers.get('Authorization');
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }
        console.log(token);

        const decodedToken = Jwt.decode(token) as CustomJwtPayload;
        const sotreId = decodedToken.storeId;
        console.log("sotreId 23:", sotreId);
        if (!sotreId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const users = await StoreUsers.find({storeId: sotreId});
        return NextResponse.json({ users }, { status: 200 })
    } catch (error) {
        console.log(error)
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}