import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema(
 
);

export default mongoose.models.UserInfo || mongoose.model("UserInfo", UserInfoSchema);