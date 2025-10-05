import mongoose  from "mongoose";

const NwesLetterSchema = new mongoose.Schema(
  {
    storeId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.NwesLetter || mongoose.model("NwesLetter", NwesLetterSchema);