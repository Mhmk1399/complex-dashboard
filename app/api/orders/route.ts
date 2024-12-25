import { NextResponse } from "next/server";
import Order from "@/models/orders";
import connect from "@/lib/data";
import jwt from "jsonwebtoken";


interface CustomJwtPayload extends jwt.JwtPayload {
    storeId: string;
}


export async function GET(request: Request) {
    await connect();

    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        const storeId = decodedToken.storeId;

        const orders = await Order.find({ storeId: storeId });

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching orders" },
            { status: 500 }
        );
    }
}
export async function POST(req: Request) {
    await connect();
    if (!connect) {
        return NextResponse.json({ error: "Connection failed!" });
    }

    const body = await req.json();
    if (!body) {
        return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }
    try {
        const order = await Order.create(body);
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

