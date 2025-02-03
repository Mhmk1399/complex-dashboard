import mongoose from "mongoose";
const EnamadSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
  },
  storeId:{
    type: String,
    required: true,
  },
  link:{
    type: String,
    required: true,
  }
});
export default mongoose.models.Enamad|| mongoose.model("Enamad", EnamadSchema) ;