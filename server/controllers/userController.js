const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const Group = require('../models/groupModel');

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await Users.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already exist", status: false });
    const emailCheck = await Users.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already exist", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const { skip, limit } = req.query;
    const users = await Users.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]).skip(skip).limit(limit);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await Users.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "Users id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.id).select([
      "email",
      "username",
      "avatarImage",
      "_id"
    ]);
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json(user);
  } catch (ex) {
    next(ex);
  }
};

// Create Group Controller
module.exports.createGroup = async (req, res, next) => {
  try {
    const { name, members, avatar, createdBy } = req.body;
    if (!name || !members || !createdBy) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    const group = await Group.create({
      name,
      members,
      avatar: avatar || '',
      createdBy,
    });
    return res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

// Get Groups for a User
module.exports.getUserGroups = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const groups = await Group.find({ members: userId })
      .select(["_id", "name", "avatar", "members"])
      .populate('members', 'username avatarImage _id')
      .lean();
    return res.json(groups);
  } catch (error) {
    next(error);
  }
};
