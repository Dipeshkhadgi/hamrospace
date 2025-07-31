import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    recipientId: String,
    senderId: String,
    message: String,
    type: String,
    createdAt: { type: Date, default: Date.now },
  });
  const Notification = mongoose.model("Notification", NotificationSchema);
  export default Notification
  