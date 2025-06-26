const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
  getUserById,
  createGroup,
  getUserGroups,
  getGroupById,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
router.get("/user/:id", getUserById);
router.post("/group", createGroup);
router.get("/groups/:id", getUserGroups);
router.get("/group/:id", getGroupById);

module.exports = router;
