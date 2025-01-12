import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Products from "@/models/products";
import jwt, { JwtPayload } from 'jsonwebtoken';
interface CustomJwtPayload extends JwtPayload {
    storeId?: string;
}
export async function POST(request: Request) {
    const productData = await request.json();

    try {
        await connect();
        const newProduct = new Products(productData);
        await newProduct.save();
        return NextResponse.json({ message: "Product created successfully", product: newProduct }, { status: 201 });
    } catch (error) {
        console.log("Error creating product:", error);
        return NextResponse.json({ message: "Error creating product",error }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
     await connect();

    try {
         const authHeader = request.headers.get("Authorization");
         if (!authHeader) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
         }
         const token = authHeader.split(" ")[1];
         if (!token)
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
                const decodedToken = jwt.decode(token) as CustomJwtPayload
                if (!decodedToken)
                    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        
                const storeId = decodedToken.storeId
                if (!storeId)
                    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        
       
        const products = await Products.find({storeId});
        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
    }
}
