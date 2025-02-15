import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    title: { type: String, required: false },
    repoUrl: { type: String, required: false },
    vercelUrl: { type: String, required: false },
    storeId: { type: String, required: true, unique: true },

  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
