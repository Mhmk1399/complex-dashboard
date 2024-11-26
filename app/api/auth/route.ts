import connect from "@/lib/data";
import { NextResponse } from "next/server";
import User from "@/models/users";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
    const { name, email, password } = await request.json();

    try {
        await connect();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ message: "Error creating user" }, { status: 500 });
    }
}


export async function GET(request: Request) {
    try {
        await connect();

        const users = await User.find();
        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
    }
}   
