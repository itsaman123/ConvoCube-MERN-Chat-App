const Messages = require("../models/messageModel");
const Users = require("../models/userModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, limit, skip } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 }).limit(limit).skip(skip);

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message sent successfully." });
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
