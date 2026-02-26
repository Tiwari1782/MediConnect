import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0=Sunday, 1=Monday ... 6=Saturday
      required: true,
      min: 0,
      max: 6,
    },
    slots: [
      {
        startTime: { type: String, required: true }, // "09:00"
        endTime: { type: String, required: true },   // "09:30"
        isBooked: { type: Boolean, default: false },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
          default: null,
        },
        price: { type: Number, default: 0 },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

scheduleSchema.index({ doctorId: 1, dayOfWeek: 1 });

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;