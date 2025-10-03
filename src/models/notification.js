import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId,required: true},
  type: { type: String, enum: ["email", "sms", "push", "inapp"], required: true },
  templateId: String,
  payload: Object,
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  attempts: { type: Number, default: 0 },
  error: String
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
