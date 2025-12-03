/* eslint-disable prettier/prettier */
import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const statusEnum = ["Approved", "Rejected", "Pending", "Draft", "Processing"];
const subStatusEnum = [
  "Draft",
  "Application Received",
  "Under Verification",
  "RO Forward to JE",
  "JE Revert to RO",
  "Under Inspection",
  "Approved",
  "Rejected",
  "Pending Payment",
  "AE Forward to EE",
  "EE Forward to SE",
];

const historySchema = new Schema(
  {
    status: { type: String, enum: statusEnum },
    sub_status: { type: String, enum: subStatusEnum },
    assignedTo: { type: String },
    action: {
      type: String,
      enum: ["Created", "StatusChange", "Forward", "Revert", "Comment", "Update"],
      default: "StatusChange",
    },
    comment: { type: String },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String },
  },
  { _id: false }
);

const formTrackSchema = new Schema(
  {
    form_id: { type: Types.ObjectId, required: true, index: true , ref: "ServiceForm" },
    applicationNo: { type: String, required: true, unique: true },
    status: { type: String, enum: statusEnum },
    sub_status: { type: String, enum: subStatusEnum },
    assignedTo: { type: String },

    // Action metadata
    action: {
      type: String,
      enum: ["Created", "StatusChange", "Forward", "Revert", "Comment", "Update"],
      default: "StatusChange",
    },
    comment: { type: String },
    actedBy: { type: String },

    // History log
    statusHistory: [historySchema],
  },
  { timestamps: true }
);

export default mongoose.model("FormTrack", formTrackSchema);
