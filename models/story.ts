import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        image: { type: String, required: true },
        storeId: { type: String, required: true },
    },
    { timestamps: true }
    );

    export default mongoose.models.Story || mongoose.model("Story", StorySchema);