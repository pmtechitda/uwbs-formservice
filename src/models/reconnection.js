import mongoose from "mongoose";

const reconnectionSchema = new mongoose.Schema(
  {
    consumerNumber: {
      type: String,
      
      trim: true,
    },
    nameOfApplicant: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    connectionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Invalid mobile number"],
    },
    permanentAddress: {
      type: String,
      required: true,
      trim: true,
    },
    relationType: {
      type: String,
      enum: ["Owner", "Tenant", "Family", "Other"],
      default: "Owner",
    },
    mutationReason: {
      type: String,
      trim: true,
    },
    ownershipStatus: {
      type: String,
      enum: ["Owned", "Rented", "Leased", "Other"],
      default: "Owned",
    },
    serviceType: {
      type: String,
      enum: ["Reconnection", "Disconnection"],
      default: null,
    },
    identityFile: {
      type: String,
      required: true,
    },
    officialId: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: false,
    },
    signature: {
      type: String,
      required: false,
    },
    previousAmount: {
      type: String,
      required: false,
    },
    charges: {
      type: String,
      required: false,
    },
    totalAmount: {
      type: String,
      required: false,
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
      enum: ["Pending", "Approved", "Rejected", "Draft"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Reconnection", reconnectionSchema);
