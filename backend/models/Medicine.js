import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: "",
    },
    composition: {
      type: String,
      required: [true, "Composition is required"],
    },
    manufacturer: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    packSize: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    sideEffects: [String],
    uses: [String],
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", composition: "text", genericName: "text" });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;