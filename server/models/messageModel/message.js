import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    attachments: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "chat",
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
