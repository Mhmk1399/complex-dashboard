import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Blog from "@/models/blogs";
import mongoose from "mongoose";

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid blog ID format' }, { status: 400 });
    }

    await connect();
    if(!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }

    try {
        const body = await req.json();
        const updateData = {
            title: body.title,
            content: body.content,
        };

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBlog, { status: 200 });
    } catch (error) {
        console.error('PATCH_ERROR', id, error);
        return NextResponse.json({ message: 'Error updating blog' }, { status: 500 });
    }
}





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
        const blog = await Blog.findById(blogId);
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
        await Blog.findByIdAndDelete(blogId);
        return new NextResponse(JSON.stringify({ message: 'Blog deleted successfully' }), { status: 200 });
    } catch (error) {
        return new NextResponse('Error deleting blog', { status: 500 });
    }

}


