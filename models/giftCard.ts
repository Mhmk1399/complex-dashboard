import mongoose from "mongoose";

export interface GiftCard {
    code: string;
    type: string;
    amount: number;
    storeId: string;
    used: boolean;
    userId?: string;
}

const giftCardSchema = new mongoose.Schema<GiftCard>({
    code: { type: String, required: true },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    amount: { type: Number, required: true },
    storeId: { type: String, required: true },
    used: { type: Boolean, default: false },
});

export default mongoose.models.GiftCard || mongoose.model<GiftCard>("GiftCard", giftCardSchema);