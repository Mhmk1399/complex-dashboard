import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Verification || mongoose.model('Verification', verificationSchema);