import mongoose from "mongoose";

const StoresUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    storeId: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);



const StoreUsers = mongoose.models.StoreUsers || mongoose.model("StoreUsers", StoresUserSchema);

export default StoreUsers;
