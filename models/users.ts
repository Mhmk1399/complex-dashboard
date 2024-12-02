import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'vendor', 'user'], required: true, default: 'user' },
    vendorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor', 
      required: function(this: { role: string }) { 
        return this.role === 'user'; 
      } 
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
