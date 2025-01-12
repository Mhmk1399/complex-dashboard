import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Blog from "@/models/blogs";
import Jwt, { JwtPayload } from "jsonwebtoken";


interface CustomJwtPayload extends JwtPayload {
    storeId: string;
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

