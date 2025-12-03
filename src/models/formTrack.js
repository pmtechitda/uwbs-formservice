/* eslint-disable prettier/prettier */
import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const FormTrack = new Schema(
  {
    applicationNo: { type: String, unique: true, required: true },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Approved", "Rejected", "Pending", "Draft", "Processing"],
        },
        sub_status: { 
            type: String,
            enum: [
                "Application Received",
                "Under Verification",
                "RO Forward to JE",
                "JE Revert to RO",
                "Under Inspection",
                "Approved",
                "Rejected",
                "Pending Payment"
            ], 
            default: "Application Received" 
        },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("FormTrack", FormTrack);
