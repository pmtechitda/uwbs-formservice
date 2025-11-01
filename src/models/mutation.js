import mongoose from "mongoose";

const mutationSchema = new mongoose.Schema(
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
    mutationReason: {
      type: String,
      trim: true,
    },
    ownershipStatus: {
      type: String,
      enum: ["Owner", "Tenant"],
      default: "Owner",
    },
    ownershipFile: {
      type: String,
      required: true,
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

export default mongoose.model("Mutation", mutationSchema);
