import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    id: { type: String, required: false, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true }, // Added description field
    content: { type: String, required: true },
    seoTitle: { type: String, required: true }, // Added seoTitle field
    authorId: { type: String, required: false },
    storeId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
