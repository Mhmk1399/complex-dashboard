import { NextRequest, NextResponse } from 'next/server';
import connect from "@/lib/data";
import Collections from "@/models/collections";
import mongoose from 'mongoose';

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const collectionId = params.id;
    console.log('DELETE_ATTEMPT', collectionId);

    await connect();
    if(!connect) {
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
        return new NextResponse(JSON.stringify({ message: 'Collection deleted successfully' }), { status: 200 });
    } catch (error) {
        console.log('DELETE_ERROR', collectionId, error);
        return new NextResponse('Error deleting collection', { status: 500 });
    }
}
export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const collectionId = params.id;
    
    try {
        await connect();
        const collection = await Collections.findById(collectionId).populate('products');
        
        if (!collection) {
            return new NextResponse('Collection not found', { status: 404 });
        }
        
        return NextResponse.json({ collection }, { status: 200 });
    } catch (error) {
        return new NextResponse('Error fetching collection', { status: 500 });
    }
};

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const collectionId = params.id;
    await connect();

    try {
        const body = await req.json();
        
        const updatedCollection = await Collections.findByIdAndUpdate(
            collectionId,
            {
                name: body.name,
                products: body.products // Store complete product objects
            },
            { new: true, runValidators: true }
        );

        return new NextResponse(JSON.stringify(updatedCollection), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.log('Update error:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to update collection' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}



