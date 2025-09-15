import GiftCard from "@/models/giftCard";
import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const giftCardId = req.nextUrl.pathname.split('/')[3];

    await connect();
    if(!connect) {
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        await GiftCard.findByIdAndDelete(giftCardId);
        return NextResponse.json({ message: 'Gift card deleted successfully' }, { status: 200 });
    } catch {
        return NextResponse.json('Error deleting gift card', { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const giftCardId = req.nextUrl.pathname.split('/')[3];

    await connect();
    if(!connect) {
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        const giftCard = await GiftCard.findById(giftCardId);
        if (!giftCard) {
            return NextResponse.json('Gift card not found', { status: 404 });
        }
        return NextResponse.json(giftCard, { status: 200 });
    } catch {
        return NextResponse.json('Error fetching gift card', { status: 500 });
    }
}   

export async function PATCH(req: NextRequest) {
    const giftCardId = req.nextUrl.pathname.split('/')[3];

    await connect();
    if(!connect) {
        return NextResponse.json('Database connection error', { status: 500 });
    }

    try {
        const body = await req.json();
        
        const updatedGiftCard = await GiftCard.findByIdAndUpdate(
            giftCardId,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedGiftCard) {
            return NextResponse.json({ message: 'Gift card not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Gift card updated successfully',
            giftCard: updatedGiftCard 
        }, { status: 200 });
    } catch {
        return NextResponse.json({ message: 'Error updating gift card' }, { status: 500 });
    }
}