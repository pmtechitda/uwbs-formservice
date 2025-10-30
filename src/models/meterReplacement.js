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
    assignedTo: {
      type: String,
      required: false,
    },
    submittedBy: {
      type: String,
      required: false,
    },
   
    status: {
      type: String,
      enum: ["Approved","Rejected", "Pending", "Draft"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("MeterReplacement", meterReplacementSchema);
