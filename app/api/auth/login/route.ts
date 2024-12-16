import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    const reDirectUrl="localhost:3000";
    await connect();
    try {
        const { phoneNumber, password } = await request.json();
        if (!phoneNumber || !password) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }
        const user = await User.findOne({ phoneNumber });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }
        const tokenSecret = process.env.JWT_SECRET;
        if (!tokenSecret) {
            throw new Error("JWT_SECRET is not defined");
        }
        const token = jwt.sign(
            { id: user._id, targetDirectory: user.targetProjectDirectory, templatesDirectory: user.templatesDirectory, emptyDirectory: user.emptyDirectory, storeId: user.storeId },
            tokenSecret,
            { expiresIn: "1h" }
        );
        const redirect = new URL(reDirectUrl);
        redirect.searchParams.set("token", token);
        return NextResponse.json({ token });


    }
    catch (error) {
        return NextResponse.json(
            { message: "Error logging in", error },
            { status: 500 }
        );
    }

}