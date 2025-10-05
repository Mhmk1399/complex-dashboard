import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    title: { type: String, required: false },
    // DiskUrl: { type: String, required: false },
    DeployedUrl: { type: String, required: false },
    storeId: { type: String, required: true, unique: true },
    trialDate: {type: Date},
    type: { type: String, enum: ["trialUser", "paidUser"], default: "trialUser" },
    selctedTemplate: { type: String , default:"" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
