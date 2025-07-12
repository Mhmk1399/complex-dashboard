import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
    storeId: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
    },
    massage:{
        type: String
    },
    name:{
        type: String
    }
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);