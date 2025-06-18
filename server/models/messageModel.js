const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: String
    },
    senderId: {
      type: String
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image" | "video"],
      default: "text"
    },
    content: {
      type: String
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      default: null
    },
    seenBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User"
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "seen"],
      default: "sending"
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    seenAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
