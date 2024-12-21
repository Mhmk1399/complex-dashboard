import mongoose from "mongoose";

const ProductScema = new mongoose.Schema(
  {
    images: {
      imageSrc: { type: String, required: true },
      imageAlt: { type: String, required: true },
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    discount: { type: String, required: true },
    id: { type: String, required: true },
    innventory: { type: String, required: true },
    storeId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Products ||
  mongoose.model("Products", ProductScema);
