import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const meterReplacementSchema = new Schema(
  {
    consumer_id: {
      type: Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: false,
      trim: true,
    },
    photo_id: {
      type: Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["Approve", "Pending", "Draft"],
      default: "Approve",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("MeterReplacement", meterReplacementSchema);
