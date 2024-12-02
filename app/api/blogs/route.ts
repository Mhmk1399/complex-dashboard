import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connect from "@/lib/data";
import Blog from "@/models/blogs";

const blogsFile = path.join(process.cwd(), 'data', 'blogs.json');

export async function POST(req: Request) {
    if(!connect) {
        console.log('POST_ERROR', 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }
  try {
    const { title, content } = await req.json();
    
    // Create blog object
    const blog = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      authorId: '1' // You can get this from auth later
    };

    // Read existing blogs
    let blogs = [];
    if (fs.existsSync(blogsFile)) {
      const data = fs.readFileSync(blogsFile, 'utf8');
      blogs = JSON.parse(data);
    }

    // Add new blog
    blogs.push(blog);
    // Ensure directory exists
    const dir = path.dirname(blogsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save updated blogs
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

export const GET = async () => {
    await connect();
    if(!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }

    try {
        const blogs = await Blog.find({});
        return NextResponse.json({ blogs }, { status: 200 });
    } catch (error) {
        return new NextResponse('Error fetching blogs', { status: 500 });
    }
}
