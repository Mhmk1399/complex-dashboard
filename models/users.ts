import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    title: { type: String, required: true },
    subdomain: { type: String, required: true },
    location: { type: String, required: true },
    socialMedia: { type: Object, required: true },
    category: { type: String, required: true },
    targetProjectDirectory: { type: String, required: true },
    templatesDirectory: { type: String, required: true },
    emptyDirectory: { type: String, required: true },
    storeId: { type: String, required: true, unique: true },

  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
