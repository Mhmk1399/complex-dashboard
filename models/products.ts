import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    images: [
      {
        imageSrc: { type: String, required: true },
        imageAlt: { type: String, required: true },
      },
    ],
    video: {
      videoSrc: { type: String, required: false },
      videoAlt: { type: String, required: false },
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: String, required: true },
    status: { type: String, required: true },
    discount: { type: String, required: true },
    properties: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    colors: [
      {
        code: { type: String, required: true },
        quantity: { type: String, required: true },
      },
    ],
    storeId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Products ||
  mongoose.model("Products", ProductSchema);
