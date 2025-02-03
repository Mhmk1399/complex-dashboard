import connect from "@/lib/data";
import Category from "@/models/category";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken'
interface CustomJwtPayload extends JwtPayload {
    storeId: string;
}

export async function GET(req: NextRequest) {
    try {
        await connect();
        console.log("Connected to MongoDB");
        if(!connect){
            return NextResponse.json({ error: "Failed to connect to database" });
        }
        const token = req.headers.get("Authorization")?.split(' ')[1];
        console.log(token);
        
        if (!token){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const decodedToken = jwt.decode(token) as CustomJwtPayload
        if (!decodedToken){
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
        const storeId=decodedToken.storeId
        if (!storeId){
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
        const categories = await Category.find({ storeId: storeId });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching categories" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        await connect();
        console.log("Connected to MongoDB");
        if(!connect){
            return NextResponse.json({ error: "Failed to connect to database" });
        }
        const token = req.headers.get("Authorization")?.split(' ')[1];
        console.log(token);
        
        if (!token){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const decodedToken = jwt.decode(token) as CustomJwtPayload
        if (!decodedToken){
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
        const storeId=decodedToken.storeId
        console.log("storeId", storeId);
        const body = await req.json();
        console.log(body)
       try{ const category  = {
            ...body,
            storeId: storeId,
        };
        console.log(category)
        const newCategory = await Category.create(category);
        return NextResponse.json(newCategory, { status: 201 });
    }catch(error){
            console.log(error)
            return NextResponse.json({ error: "Error creating category" }, { status: 500 });
        }
        

    } catch (error) {
        return NextResponse.json({ error: "Error creating category" }, { status: 500 });
    }
}
export async function PATCH(req: NextRequest) {
    try {
        await connect();
        if(!connect){
            return NextResponse.json({ error: "Failed to connect to database" });
        }
        const token = req.headers.get('Authorization')
        if (!token){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decodedToken = jwt.verify(token || '', process.env.JWT_SECRET || '') as JwtPayload;
        if (!decodedToken){
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const storeId = decodedToken.storeId;
        if (!storeId){
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(body.id, body, { new: true });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Error updating category" }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    try {
        await connect();
        if(!connect){
            return NextResponse.json({ error: "Failed to connect to database" });
        }
        
        const body = await req.json();
        const category = await Category.findByIdAndDelete(body.id);
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Error deleting category" }, { status: 500 });
    }
}
        







