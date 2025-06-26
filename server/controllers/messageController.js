const Messages = require("../models/messageModel");
const Users = require("../models/userModel");
const Group = require("../models/groupModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, limit, skip } = req.body;

    // Check if this is a group chat
    const group = await Group.findById(to);

    let messages;
    if (group) {
      // This is a group chat - get messages where 'to' is the group ID
      messages = await Messages.find({
        to: to
      }).sort({ updatedAt: 1 }).limit(limit).skip(skip);
    } else {
      // This is an individual chat
      messages = await Messages.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 }).limit(limit).skip(skip);
    }

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        _id: msg._id,
        replyTo: msg.replyTo,
        status: msg.status || "sent" // Default to "sent" if status is not set
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, messageId, replyTo } = req.body;

    // Check if this is a group message
    const group = await Group.findById(to);

    let messageData;
    if (group) {
      // This is a group message
      messageData = await Messages.create({
        message: { text: message },
        users: group.members, // Include all group members
        sender: from,
        to: to, // Store the group ID as 'to'
        toModel: 'Group', // Set the model reference
        chatId: to,
        messageId: messageId,
        replyTo: replyTo,
        status: "sent" // Set status to sent when storing in database
      });
    } else {
      // This is an individual message
      messageData = await Messages.create({
        message: { text: message },
        users: [from, to],
        sender: from,
        to: to, // Store the recipient ID as 'to'
        toModel: 'Users', // Set the model reference
        messageId: messageId,
        replyTo: replyTo,
        status: "sent" // Set status to sent when storing in database
      });
    }

    if (messageData) return res.json({ msg: "Message sent successfully." });
    else return res.json({ msg: "Failed to send message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.togglePinStatus = async (req, res, next) => {
  try {
    const { userId, chatId, chatType } = req.body;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (!chatId || !chatType) {
      return res.status(400).json({ msg: "chatId and chatType are required" });
    }
    // Check if already pinned
    const index = user.pinnedChats.findIndex(
      c => c.chatId === chatId && c.type === chatType
    );
    let isPinned;
    if (index > -1) {
      // Unpin
      user.pinnedChats.splice(index, 1);
      isPinned = false;
    } else {
      // Pin
      user.pinnedChats.push({ chatId, type: chatType });
      isPinned = true;
    }
    await user.save();
    return res.json({
      msg: "Pin status updated successfully",
      isPinned,
      pinnedChats: user.pinnedChats
    });
  } catch (ex) {
    next(ex);
  }
};
