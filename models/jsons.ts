import mongoose from "mongoose";

const JsonSchema = new mongoose.Schema({
 storeId: { type: String, required: true },   
 route: { type: String, required: true },
 lgContent: { type: mongoose.Schema.Types.Mixed, required: true },
 smContent: { type: mongoose.Schema.Types.Mixed, required: true },
 version: { type: String, default: "1" },
});

JsonSchema.index({ storeId: 1, route: 1 }, { unique: true });
export default mongoose.models.Jsons || mongoose.model("Jsons", JsonSchema);