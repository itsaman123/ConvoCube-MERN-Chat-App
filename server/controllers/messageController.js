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
    const { userId, contactId } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Toggle the pin status
    user.isPinned = !user.isPinned;
    await user.save();

    return res.json({
      msg: "Pin status updated successfully",
      isPinned: user.isPinned
    });
  } catch (ex) {
    next(ex);
  }
};
