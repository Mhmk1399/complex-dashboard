import connect from "@/lib/data";
import Order from "@/models/orders";
import { NextResponse } from "next/server";






export async function GET(request: Request, { params }: { params: { id: string } }) {
    await connect();
    if (!connect) {
        return NextResponse.json({ error: "Connection failed!" });
    }
    try {
        const id = params.id;
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json(order, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}