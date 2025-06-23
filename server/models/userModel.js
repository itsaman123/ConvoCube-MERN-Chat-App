const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  statusMessage: {
    type: String,
    default: "Hey I am using ChatApp",
    maxLength: 150,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  socketId: {
    type: String,
    default: "",
  },
  deviceTokens: [
    {
      type: String
    }
  ],
  pinnedChats: [
    {
      chatId: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['user', 'group'],
        required: true
      }
    }
  ],
  isPinned: {
    type: Boolean,
    default: false
  }


}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);
