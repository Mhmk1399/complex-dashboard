import mongoose from "mongoose";
const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // superadmin or vendor admin
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
