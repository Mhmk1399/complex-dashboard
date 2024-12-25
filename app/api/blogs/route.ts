import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Blog from "@/models/blogs";
import blogs from "@/models/blogs";
import Jwt, { JwtPayload } from "jsonwebtoken";


interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}

export async function POST(req: Request) {
  const BlogData = await req.json();

  try {
    await connect();
    if (!connect) {
      console.log("POST_ERROR", "Database connection failed");
      return new NextResponse("Database connection error", { status: 500 });
    }
    const newBlog = new blogs(BlogData);
    console.log(newBlog);
    
    await newBlog.save();
    console.log("POST_SUCCESS", "Blog created successfully");
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error logging in",error }, { status: 500 });

  }
}

export const GET = async (req:NextRequest) => {
  await connect();
  if (!connect) {
    return new NextResponse("Database connection error", { status: 500 });
  }

  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const decodedToken = Jwt.decode(token) as CustomJwtPayload;
    const sotreId = decodedToken.storeId;
    if (!sotreId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const blogs = await Blog.findOne({storeId: sotreId});
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error logging in",error }, { status: 500 });
  }
};
