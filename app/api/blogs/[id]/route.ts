import blogs from "@/models/blogs";
import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";



export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const blogId = params.id;
    if (!blogId) {
        return new NextResponse('Blog ID is required', { status: 400 });
    }
    await connect();
    if(!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }


    try {
        const blog = await blogs.findById(blogId);
        if (!blog) {
            return new NextResponse('Blog not found', { status: 404 });
        }
        return new NextResponse(JSON.stringify(blog), { status: 200 });
    } catch (error) {
        return new NextResponse('Error fetching blog', { status: 500 });
    }
}

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const blogId = params.id;
    if (!blogId) {
        return new NextResponse('Blog ID is required', { status: 400 });
    }
    await connect();
    if(!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }
    try {
        await blogs.findByIdAndDelete(blogId);
        return new NextResponse(JSON.stringify({ message: 'Blog deleted successfully' }), { status: 200 });
    } catch (error) {
        return new NextResponse('Error deleting blog', { status: 500 });
    }

}

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const blogId = params.id;
    if (!blogId) {
        return new NextResponse('Blog ID is required', { status: 400 });
    }
    await connect();
    if(!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }
    try {
        const body = await req.json();
        const updatedBlog = await blogs.findByIdAndUpdate(blogId, body, { new: true });
        if (!updatedBlog) {
            return new NextResponse('Blog not found', { status: 404 });
        }
        return new NextResponse(JSON.stringify(updatedBlog), { status: 200 });
    } catch (error) {
        return new NextResponse('Error updating blog', { status: 500 });
    }
}

