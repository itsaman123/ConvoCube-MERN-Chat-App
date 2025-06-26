const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
const Group = require("./models/groupModel");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.get('/health', (req, res) => {
  res.send({
    Message: 'Backend working Fine',
  })

})

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    // origin: "https://convocube-chat.vercel.app",
    credentials: true,
  },
});

global.onlineUsers = new Map();
global.typingUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", async (data) => {
    try {
      if (data.chatType === "group") {
        // Handle group message - emit to all group members
        const group = await Group.findById(data.to).populate('members', '_id');
        if (group) {
          group.members.forEach(member => {
            const memberSocket = onlineUsers.get(member._id.toString());
            if (memberSocket && member._id.toString() !== data.from) {
              socket.to(memberSocket).emit("msg-recieve", {
                msg: data.msg,
                from: data.from,
                to: data.to,
                chatType: "group",
                status: "sent"
              });
            }
          });
        }
      } else {
        // Handle individual message
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("msg-recieve", {
            msg: data.msg,
            from: data.from,
            status: "sent"
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("typing", async (data) => {
    try {
      if (data.chatType === "group") {
        // Handle group typing - emit to all group members
        const group = await Group.findById(data.to).populate('members', '_id');
        if (group) {
          group.members.forEach(member => {
            const memberSocket = onlineUsers.get(member._id.toString());
            if (memberSocket && member._id.toString() !== data.from) {
              socket.to(memberSocket).emit("user-typing", {
                from: data.from,
                to: data.to,
                chatType: "group",
                isTyping: data.isTyping
              });
            }
          });
        }
      } else {
        // Handle individual typing
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("user-typing", {
            from: data.from,
            isTyping: data.isTyping
          });
        }
      }
    } catch (error) {
      console.error("Error handling typing:", error);
    }
  });

  socket.on("stop-typing", async (data) => {
    try {
      if (data.chatType === "group") {
        // Handle group stop typing - emit to all group members
        const group = await Group.findById(data.to).populate('members', '_id');
        if (group) {
          group.members.forEach(member => {
            const memberSocket = onlineUsers.get(member._id.toString());
            if (memberSocket && member._id.toString() !== data.from) {
              socket.to(memberSocket).emit("user-stopped-typing", {
                from: data.from,
                to: data.to,
                chatType: "group"
              });
            }
          });
        }
      } else {
        // Handle individual stop typing
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("user-stopped-typing", {
            from: data.from
          });
        }
      }
    } catch (error) {
      console.error("Error handling stop typing:", error);
    }
  });

  socket.on("message-delivered", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-delivered", {
        to: data.to,
        messageId: data.messageId
      });
    }
  });

  socket.on("message-seen", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-seen", {
        to: data.to,
        messageId: data.messageId
      });
    }
  });

  socket.on("disconnect", () => {
    // Remove user from online users when they disconnect
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});
