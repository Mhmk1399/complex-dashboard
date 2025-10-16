import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: string;
  amount: number;
  currency: 'IRT';
  description: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'verified' | 'refunded';
  authority?: string;
  refId?: number;
  cardPan?: string;
  cardHash?: string;
  feeType?: string;
  fee?: number;
  zarinpalCode?: number;
  zarinpalMessage?: string;
  metadata?: {
    mobile?: string;
    email?: string;
    order_id?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  verifiedAt?: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['IRT'],
    default: 'IRT',
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'verified', 'refunded'],
    default: 'pending',
  },
  authority: {
    type: String,
  },
  refId: {
    type: Number,
  },
  cardPan: {
    type: String,
  },
  cardHash: {
    type: String,
  },
  feeType: {
    type: String,
  },
  fee: {
    type: Number,
  },
  zarinpalCode: {
    type: Number,
  },
  zarinpalMessage: {
    type: String,
  },
  metadata: {
    mobile: String,
    email: String,
    order_id: String,
  },
  paidAt: {
    type: Date,
  },
  verifiedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});



export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);