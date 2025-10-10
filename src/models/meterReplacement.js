import mongoose from "mongoose";

const meterReplacementSchema = new mongoose.Schema(
  {
    consumerNumber: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("MeterReplacement", meterReplacementSchema);
