import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
    },
    basic: {
      type: {
        storeName: { type: String, default: "" },
        logo: { type: String, default: "" },
        description: { type: String, default: "" },
      },
      default: {},
    },
    design: {
      type: {
        backgroundColor: { type: String, default: "#ffffff" },
        font: { type: String, default: "iranSans" },
      },
      default: {},
    },
    contact: {
      type: {
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        address: { type: String, default: "" },
      },
      default: {},
    },
    social: {
      type: {
        instagram: { type: String, default: "" },
        telegram: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Clear existing model to avoid validation cache issues
if (mongoose.models.UserInfo) {
  delete mongoose.models.UserInfo;
}

export default mongoose.model("UserInfo", UserInfoSchema);