import { NextResponse } from "next/server";
import connect from "@/lib/data";
import Order from "@/models/orders";
import jwt, { JwtPayload } from "jsonwebtoken";
interface Order {
  _id: string;
  userId: string;
  storeId: string;
  postCode?: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}
interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}

export async function POST(req: Request) {
  await connect();
  if (!connect)
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  try {
    const body = await req.json();
    const order = new Order(body);
    await order.save();
    return NextResponse.json(
      { message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function GET(req: Request) {
  await connect();
  if (!connect)
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  try {
    const token = req.headers.get("Authorization");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = jwt.decode(token) as CustomJwtPayload;
    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const storeId = decodedToken.storeId;
    if (!storeId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const orders = await Order.find({ });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  await connect();
  if (!connect) {
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  }

  const body = await request.json();
  console.log(body._id);
  const result = await findByIdAndUpdate(body._id, body);
  return NextResponse.json(result);
}
async function findByIdAndUpdate(orderId: string, updateData: Order) {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });
    if (!orderId) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }
    if (!updateData) {
      return NextResponse.json(
        { error: "update data not found" },
        { status: 404 }
      );
    }
    if (!updatedOrder) {
      return NextResponse.json({ error: "failed to update" });
    }
    return updatedOrder;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "failed to update" }, { status: 500 });
  }
}
