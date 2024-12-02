import { NextResponse } from "next/server";
import connect from "@/lib/data";
import Blog from "@/models/blogs";

export async function POST(req: Request) {
  const BlogData = await req.json();

  try {
    await connect();
    if (!connect) {
      console.log("POST_ERROR", "Database connection failed");
      return new NextResponse("Database connection error", { status: 500 });
    }
    console.log(BlogData);
    const newBlog = new Blog(BlogData);
    console.log(newBlog);
   const savedBlog = await newBlog.save();
    
    console.log("POST_SUCCESS", "Blog created successfully");
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

export const GET = async () => {
  await connect();
  if (!connect) {
    return new NextResponse("Database connection error", { status: 500 });
  }

  try {
    const blogs = await Blog.find({});
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return new NextResponse("Error fetching blogs", { status: 500 });
  }
};