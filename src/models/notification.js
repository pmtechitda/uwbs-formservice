import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId,required: false},
  type: { type: String, enum: ["email", "sms", "push", "inapp"], required: true },
  payload: Object,
  title:{type:String,required:true},
  description:{type:String,required:true},
  notificationType:{type:String,required:true,enu:['signup','service-request','complaint','new-application']},
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  attempts: { type: Number, default: 0 },
  error: String
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
