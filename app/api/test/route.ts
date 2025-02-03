import connect  from "@/lib/data";
import { roleMiddleware } from "@/middlewares/decodeToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connect();
        if(!connect){
            return NextResponse.json({ error: "Failed to connect to database" });
        }
        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
       
        const storeId = await roleMiddleware(token);
        return NextResponse.json( storeId );
    } catch (error) {
        return NextResponse.json({ error: "Error fetching categories" }, { status   : 500 });
    }

}