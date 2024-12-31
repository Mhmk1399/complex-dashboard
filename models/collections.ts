import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        storeId: { type: String, required: true },
        products: [{
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
            name: String,
            images: {
                imageSrc: String,
                imageAlt: String
            },
            price: String,
            description: String,
            category: String,
            status: String,
            discount: String,
            innventory: String,
            storeId:String,
        }]
    },
    { timestamps: true }
);

export default mongoose.models.Collections || mongoose.model("Collections", CollectionSchema);
