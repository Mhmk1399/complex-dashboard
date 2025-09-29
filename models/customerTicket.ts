import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["customer", "admin"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const CustomerTicketSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreUsers",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  messages: [MessageSchema],
  storeId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CustomerTicketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.CustomerTicket || mongoose.model("CustomerTicket", CustomerTicketSchema);