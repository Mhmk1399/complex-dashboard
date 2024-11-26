import products from "@/models/products";
import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

const logOperation = (operation: string, productId: string, details?: any) => {
    console.log(`[${new Date().toISOString()}] ${operation} - Product ID: ${productId}`);
    if (details) {
        console.log('Details:', JSON.stringify(details, null, 2));
    }
}

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const productId = params.id;
    logOperation('DELETE_ATTEMPT', productId);

    await connect();
    if(!connect) {
        logOperation('DELETE_ERROR', productId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!productId) {
        logOperation('DELETE_ERROR', productId, 'Missing product ID');
        return new NextResponse('Product ID is required', { status: 400 });
    }

    try {
        await products.findByIdAndDelete(productId);
        logOperation('DELETE_SUCCESS', productId);
        return new NextResponse(JSON.stringify({ message: 'Product deleted successfully' }), { status: 200 });
    } catch (error) {
        logOperation('DELETE_ERROR', productId, error);
        return new NextResponse('Error deleting product', { status: 500 });
    }
}

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const productId = params.id;
    logOperation('GET_ATTEMPT', productId);

    await connect();
    if(!connect) {
        logOperation('GET_ERROR', productId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!productId) {
        logOperation('GET_ERROR', productId, 'Missing product ID');
        return new NextResponse('Product ID is required', { status: 400 });
    }

    try {
        const product = await products.findById(productId);
        if (!product) {
            logOperation('GET_ERROR', productId, 'Product not found');
            return new NextResponse('Product not found', { status: 404 });
        }
        logOperation('GET_SUCCESS', productId, product);
        return new NextResponse(JSON.stringify(product), { status: 200 });
    } catch (error) {
        logOperation('GET_ERROR', productId, error);
        return new NextResponse('Error fetching product', { status: 500 });
    }
}   

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
    const productId = params.id;
    logOperation('PATCH_ATTEMPT', productId);

    await connect();
    if(!connect) {
        logOperation('PATCH_ERROR', productId, 'Database connection failed');
        return new NextResponse('Database connection error', { status: 500 });
    }

    if (!productId) {
        logOperation('PATCH_ERROR', productId, 'Missing product ID');
        return new NextResponse('Product ID is required', { status: 400 });
    }

    try {
        const body = await req.json();
        const {
            imageSrc,
            imageAlt,
            name,
            description,
            category,
            price,
            status,
            discount,
            innventory,
            setting
        } = body;

        const updateData = {
            imageSrc,
            imageAlt,
            name,
            description,
            category,
            price,
            status,
            discount,
            innventory,
            setting: {
                imageWidth: setting?.imageWidth,
                imageHeight: setting?.imageHeight,
                imageRadius: setting?.imageRadius,
                productNameColor: setting?.productNameColor,
                productNameFontSize: setting?.productNameFontSize,
                productNameFontWeight: setting?.productNameFontWeight,
                priceColor: setting?.priceColor,
                priceFontSize: setting?.priceFontSize,
                descriptionColor: setting?.descriptionColor,
                descriptionFontSize: setting?.descriptionFontSize,
                btnBackgroundColor: setting?.btnBackgroundColor,
                btnTextColor: setting?.btnTextColor
            }
        };

        const updatedProduct = await products.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            logOperation('PATCH_ERROR', productId, 'Product not found');
            return new NextResponse('Product not found', { status: 404 });
        }

        logOperation('PATCH_SUCCESS', productId, updatedProduct);
        return new NextResponse(JSON.stringify({ 
            message: 'Product updated successfully',
            product: updatedProduct 
        }), { status: 200 });
    } catch (error) {
        logOperation('PATCH_ERROR', productId, error);
        return new NextResponse('Error updating product', { status: 500 });
    }
}
