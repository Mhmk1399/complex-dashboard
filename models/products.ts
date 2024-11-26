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
    setting: {
      cardBorderRadius: { type: String, required: true },
      cardBackground: { type: String, required: true },
      imageWidth: { type: String, required: true },
      imageheight: { type: String, required: true },
      imageRadius: { type: String, required: true },
      nameFontSize: { type: String, required: true },
      nameFontWeight: { type: String, required: true },
      nameColor: { type: String, required: true },
      descriptionFontSize: { type: String, required: true },
      descriptionFontWeight: { type: String, required: true },
      descriptionColor: { type: String, required: true },
      priceFontSize: { type: String, required: true },
      pricecolor: { type: String, required: true },
      btnBackgroundColor: { type: String, required: true },
      btnTextColor: { type: String, required: true }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Products ||
  mongoose.model("Products", ProductScema);
