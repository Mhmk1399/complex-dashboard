import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Blog from "@/models/blogs";
import mongoose from "mongoose";
import Jwt, { JwtPayload } from "jsonwebtoken";


interface CustomJwtPayload extends JwtPayload {
    storeId: string;
}

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid blog ID format' }, { status: 400 });
    }

    await connect();
    if (!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }

    try {
        const body = await req.json();
        const token = req.headers.get('Authorization')?.split(' ')[1];
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


        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { ...body, storeId: sotreId },
            { new: true });

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
    const id = params.id;
    if (!id) {
        return new NextResponse('Blog ID is required', { status: 400 });
    }
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    const decodedToken = Jwt.decode(token) as CustomJwtPayload;
    if (!decodedToken) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    const sotreId = decodedToken.storeId;
    if (!sotreId) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    await connect();
    if (!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }



    const blog = await Blog.findById({ _id: id, storeId: sotreId });
    if (!blog) {
        return new NextResponse('Blog not found', { status: 404 });
    }
    return new NextResponse(JSON.stringify(blog), { status: 200 });

}

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const id = params.id;
    if (!id) {
        return new NextResponse('Blog ID is required', { status: 400 });
    }
    await connect();
    if (!connect) {
        return new NextResponse('Database connection error', { status: 500 });
    }

    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    const decodedToken = Jwt.decode(token) as CustomJwtPayload;
    if (!decodedToken) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    const sotreId = decodedToken.storeId;
    if (!sotreId) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    const blogId = id;
    if (!blogId) {
        return new NextResponse('Blog ID is required', { status: 400 });
    }

    await Blog.findByIdAndDelete({ _id: id, storeId: sotreId });
    return new NextResponse(JSON.stringify({ message: 'Blog deleted successfully' }), { status: 200 });



}