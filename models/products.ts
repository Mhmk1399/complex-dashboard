import mongoose from "mongoose";

const ProductScema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    
  },
  { timestamps: true }
);

 export default mongoose.models.Products || mongoose.model("Products", ProductScema);
