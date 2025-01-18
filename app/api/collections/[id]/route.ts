import { NextRequest, NextResponse } from 'next/server';
import connect from "@/lib/data";
import Collections from "@/models/collections";

export async function DELETE(req: NextRequest) {
    const collectionId = req.nextUrl.pathname.split('/')[3];
    console.log('DELETE_ATTEMPT', collectionId);

    await connect();
    if(!connect) {
        console.log('DELETE_ERROR', collectionId, 'Database connection failed');
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        const deletedCollection = await Collections.findByIdAndDelete(collectionId);
        
        if (!deletedCollection) {
            console.log('DELETE_ERROR', collectionId, 'Collection not found');
            return NextResponse.json('Collection not found', { status: 404 });
        }

        console.log('DELETE_SUCCESS', collectionId);
        return NextResponse.json({ message: 'Collection deleted successfully' }, { status: 200 });
    } catch (error) {
        console.log('DELETE_ERROR', collectionId, error);
        return NextResponse.json('Error deleting collection', { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const collectionId = req.nextUrl.pathname.split('/')[3];
    
    try {
        await connect();
        const collection = await Collections.findById(collectionId).populate('products');
        
        if (!collection) {
            return NextResponse.json('Collection not found', { status: 404 });
        }
        
        return NextResponse.json({ collection }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching collection", error }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    await connect();
    const collectionId = req.nextUrl.pathname.split('/')[3];

    try {
        const body = await req.json();
        
        const updatedCollection = await Collections.findByIdAndUpdate(
            collectionId,
            {
                name: body.name,
                products: body.products
            },
            { new: true, runValidators: true }
        );

        if (!updatedCollection) {
            return NextResponse.json({ message: 'Collection not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCollection, { status: 200 });
    } catch (error) {
        console.log('Update error:', error);
        return NextResponse.json({ message: 'Failed to update collection' }, { status: 500 });
    }
}
