import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import blogs from "@/models/blogs";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = await params.id;
        await connect();
        const blog = await blogs.findOne({ _id: id });  // Changed from { id } to { _id: id }
        
        if (!blog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }
        
        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching blog' }, { status: 500 });
    }
}



export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = await params.id;
        const body = await request.json();
        
        await connect();
        const updatedBlog = await blogs.findOneAndUpdate(
            { _id: id },  // Changed from { id } to { _id: id }
            body,
            { new: true, runValidators: true }
        );
        
        if (!updatedBlog) {
            return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedBlog);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating blog' }, { status: 500 });
    }
}

