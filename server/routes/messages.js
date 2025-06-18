const { addMessage, getMessages, togglePinStatus } = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/togglepin/", togglePinStatus);

module.exports = router;
