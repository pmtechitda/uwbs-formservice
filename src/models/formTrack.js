/* eslint-disable prettier/prettier */
import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const FormTrack = new Schema(
  {
    form_id: { type: Types.ObjectId, required: true },
    formName: { type: String,enum: ["reconnection", "disconnection", "mutation", "tanker", "meter_replacement"] },
    old_user_id: { type: Types.ObjectId },
    new_user_id: { type: Types.ObjectId },
    comment: { type: String, default: "" },
    submitted_by: { type: Types.ObjectId },
    assign_to: { type: Types.ObjectId },
    status: {
      type: String,
      enum: ["Forward", "Revert"],
      default: "Forward",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FormTrack", FormTrack);
