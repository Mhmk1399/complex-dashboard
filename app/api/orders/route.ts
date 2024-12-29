import { NextResponse } from 'next/server'
import connect from '@/lib/data'
import Order from '@/models/orders'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface CustomJwtPayload extends JwtPayload {
    storeId: string;
}

export async function POST(req: Request) {
    await connect();
    if (!connect)
        return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    try {
        const body = await req.json()
        const order = new Order(body)
        await order.save()
        return NextResponse.json({ message: "Order created successfully" }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
export async function GET(req: Request) {
    await connect();
    if (!connect)
        return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    try {
        const token = req.headers.get("Authorization")
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const decodedToken = jwt.decode(token) as CustomJwtPayload
        if (!decodedToken)
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })

        const storeId = decodedToken.storeId
        if (!storeId)
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })


        const orders = await Order.find({storeId})
        return NextResponse.json(orders, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}