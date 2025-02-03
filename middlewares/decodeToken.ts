import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const roleMiddleware = async (token: string) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string; storeId: string };
    const storeId = decoded.storeId;

    if (!storeId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return storeId;
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
