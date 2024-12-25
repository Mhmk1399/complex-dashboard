import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  storeId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Files = mongoose.models.Files || mongoose.model("Files", fileSchema);

export default Files;
