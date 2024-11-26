import mongoose from "mongoose";

const ProductScema = new mongoose.Schema(
  {
    imageSrc: { type: String, required: true },
    imageAlt: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true },
    discount: { type: String, required: true },
    id: { type: String, required: true },
    innventory: { type: String, required: true },
    setting: {
      imageWidth: { type: String, required: true },
      imageHeight: { type: String, required: true },
      imageRadius: { type: String, required: true },
      productNameColor: { type: String, required: true },
      productNameFontSize: { type: String, required: true },
      productNameFontWeight: { type: String, required: true },
      priceColor: { type: String, required: true },
      priceFontSize: { type: String, required: true },
      descriptionColor: { type: String, required: true },
      descriptionFontSize: { type: String, required: true },
      btnBackgroundColor: { type: String, required: true },
      btnTextColor: { type: String, required: true }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Products || mongoose.model("Products", ProductScema);
