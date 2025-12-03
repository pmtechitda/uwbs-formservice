import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const serviceFormSchema = new Schema(
    {

        applicationNo: { type: String, unique: true, required: true },

        serviceType: {
            type: String,
            enum: ["MeterReplacement", "Mutation", "Reconnection", "Tanker"],
            required: true,
        },

        department_id: { type: Types.ObjectId, required: true },
        departmentName: { type: String, required: true },
        division_id: { type: Types.ObjectId, required: true },
        division_name: { type: String, required: true },
        collection_center_id: { type: Types.ObjectId, required: true },
        collection_center_name: { type: String, required: true },


        consumer_id: { type: Types.ObjectId },
        consumerNumber: { type: String, trim: true },

        current_name: { type: String, trim: true },
        current_fatherName: { type: String, trim: true },

        current_mobileNumber: {
            type: String,
            match: [/^[0-9]{10}$/, "Invalid mobile number"],
        },

        new_name: { type: String, trim: true },
        new_fatherName: { type: String, trim: true },
        new_mobileNumber: {
            type: String,
            match: [/^[0-9]{10}$/, "Invalid mobile number"],
        },

        reason: { type: String, trim: true },
        documents: {
            idProof: { type: String },
            selfPhoto: { type: String },
            registryDocument: { type: String },
            stampPaper: { type: String },
        },

        is_paid: { type: Boolean, default: false },        
        previousAmount: { type: String },
        charges: { type: String },
        otherCharges: { type: String },
        totalAmount: { type: String },

        // Assignment
        assignedTo: { type: String },
        submittedBy: { type: String },
        submittedType: { type: String, enum: ["Consumer", "RO", "CSC", "Apuni Sarkar"] },

        // Status for all services
        status: {
            type: String,
            enum: ["Approved", "Rejected", "Pending", "Draft", "Processing"],
            default: "Draft",
        },

        sub_status: { 
            type: String,
            enum: [
                "Draft",
                "Application Received",
                "Under Verification",
                "RO Forward to JE",
                "JE Revert to RO",
                "Under Inspection",
                "Approved",
                "Rejected",
                "Pending Payment"
            ], 
            default: "Draft" 
        },





    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("ServiceForm", serviceFormSchema);
