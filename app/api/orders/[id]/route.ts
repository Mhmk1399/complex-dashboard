import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/orders";
import Jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}

export async function GET(req: NextRequest) {
  await connect();
  if (!connect) {
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  }

  try {
    const id = req.nextUrl.pathname.split("/")[3];
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
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

    const order = await Order.findOne({ _id: id });
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await connect();
  if (!connect) {
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  }

  try {
    const id = req.nextUrl.pathname.split("/")[3];
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
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

    const order = await Order.findOne({ _id: id, storeId: storeId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await Order.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await connect();
  if (!connect) {
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  }

  try {
    const id = req.nextUrl.pathname.split("/")[3];
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
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
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, storeId: storeId },
      body,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
