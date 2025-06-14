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
    ]

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
