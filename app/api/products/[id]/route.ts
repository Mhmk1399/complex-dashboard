import products from "@/models/products";
import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

const logOperation = (operation: string, productId: string, details?: string | object) => {
    console.log(`[${new Date().toISOString()}] ${operation} - Product ID: ${productId}`);
    if (details) {
        console.log('Details:', JSON.stringify(details, null, 2));
    }
}

export async function DELETE(req: NextRequest) {
    const productId = req.nextUrl.pathname.split('/')[3];
    logOperation('DELETE_ATTEMPT', productId);

    await connect();
    if(!connect) {
        logOperation('DELETE_ERROR', productId, 'Database connection failed');
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        await products.findByIdAndDelete(productId);
        logOperation('DELETE_SUCCESS', productId);
        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
    } catch (error) {
        logOperation('DELETE_ERROR', productId, error as string | object);
        return NextResponse.json('Error deleting product', { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const productId = req.nextUrl.pathname.split('/')[3];
    logOperation('GET_ATTEMPT', productId);

    await connect();
    if(!connect) {
        logOperation('GET_ERROR', productId, 'Database connection failed');
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        const product = await products.findById(productId);
        if (!product) {
            logOperation('GET_ERROR', productId, 'Product not found');
            return NextResponse.json('Product not found', { status: 404 });
        }
        logOperation('GET_SUCCESS', productId, product);
        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        logOperation('GET_ERROR', productId, error as string | object);
        return NextResponse.json('Error fetching product', { status: 500 });
    }
}   

export async function PATCH(req: NextRequest) {
    const productId = req.nextUrl.pathname.split('/')[3];
    logOperation('PATCH_ATTEMPT', productId);

    await connect();
    if(!connect) {
        logOperation('PATCH_ERROR', productId, 'Database connection failed');
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        const body = await req.json();
        const updateData = {
            images: {
                imageSrc: body.images.imageSrc,
                imageAlt: body.images.imageAlt,
            },
            name: body.name,
            description: body.description,
            category: body.category,
            price: body.price,
            status: body.status,
            discount: body.discount,
            innventory: body.innventory
        };

        const updatedProduct = await products.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Product updated successfully',
            product: updatedProduct 
        }, { status: 200 });
    } catch (error) {
        logOperation('PATCH_ERROR', productId, error as string | object);
        return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
    }
}
