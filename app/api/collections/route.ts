import { NextRequest, NextResponse } from 'next/server';
import connect from "@/lib/data";
import Collections from "@/models/collections";
import jwt, { JwtPayload } from 'jsonwebtoken';
interface CustomJwtPayload extends JwtPayload {
    storeId?: string;
}

export async function POST(request: Request) {
    const collectionData = await request.json();

    try {
        await connect();
        const newCollection = new Collections(collectionData);
        await newCollection.save();
        return NextResponse.json({ message: "Collection created successfully", collection: newCollection }, { status: 201 });
    } catch (error) {
        console.error("Error creating collection:", error);
        return NextResponse.json({ message: "Error creating collection" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {


    try {
        await connect();
         const token = request.headers.get("Authorization")?.split(" ")[1]
                if (!token)
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
                const decodedToken = jwt.decode(token) as CustomJwtPayload
                if (!decodedToken)
                    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        
                const storeId = decodedToken.storeId
                if (!storeId)
                    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        
        const collections = await Collections.find({storeId});
        return NextResponse.json({ collections }, { status: 200 });
    } catch (error) {
        console.log("Error fetching collections:", error);
        return NextResponse.json({ message: "Error fetching collections" }, { status: 500 });
    }
}

export const DELETE = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('id');
    console.log('DELETE_ATTEMPT', collectionId);

    await connect();
    if (!connect) {
        console.log('DELETE_ERROR', collectionId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!collectionId) {
        console.log('DELETE_ERROR', collectionId, 'Missing collection ID');
        return new NextResponse('Collection ID is required', { status: 400 });
    }

    try {
        const deletedCollection = await Collections.findByIdAndDelete(collectionId);
        
        if (!deletedCollection) {
            console.log('DELETE_ERROR', collectionId, 'Collection not found');
            return new NextResponse('Collection not found', { status: 404 });
        }

        console.log('DELETE_SUCCESS', collectionId);
        return new NextResponse('Collection deleted successfully', { status: 200 });
    } catch (error) {
        console.log('DELETE_ERROR', collectionId, error);
        return new NextResponse('Error deleting collection', { status: 500 });
    }
};