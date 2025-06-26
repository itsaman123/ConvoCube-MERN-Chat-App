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
      // Check if this is a group message
      const group = await Group.findById(data.to);

      if (group) {
        // This is a group message - send to all group members
        group.members.forEach(memberId => {
          if (memberId.toString() !== data.from) { // Don't send to sender
            const memberSocket = onlineUsers.get(memberId.toString());
            if (memberSocket) {
              socket.to(memberSocket).emit("msg-recieve", {
                msg: data.msg,
                from: data.from,
                to: data.to,
                status: "sent",
                isGroup: true,
                groupName: group.name
              });
            }
          }
        });
      } else {
        // This is an individual message
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
      console.error("Error in send-msg:", error);
    }
  });

  socket.on("typing", async (data) => {
    try {
      // Check if this is a group typing
      const group = await Group.findById(data.to);

      if (group) {
        // Send typing indicator to all group members
        group.members.forEach(memberId => {
          if (memberId.toString() !== data.from) {
            const memberSocket = onlineUsers.get(memberId.toString());
            if (memberSocket) {
              socket.to(memberSocket).emit("user-typing", {
                from: data.from,
                to: data.to,
                isTyping: data.isTyping,
                isGroup: true
              });
            }
          }
        });
      } else {
        // Individual typing
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("user-typing", {
            from: data.from,
            isTyping: data.isTyping
          });
        }
      }
    } catch (error) {
      console.error("Error in typing:", error);
    }
  });

  socket.on("stop-typing", async (data) => {
    try {
      // Check if this is a group typing
      const group = await Group.findById(data.to);

      if (group) {
        // Send stop typing to all group members
        group.members.forEach(memberId => {
          if (memberId.toString() !== data.from) {
            const memberSocket = onlineUsers.get(memberId.toString());
            if (memberSocket) {
              socket.to(memberSocket).emit("user-stopped-typing", {
                from: data.from,
                to: data.to,
                isGroup: true
              });
            }
          }
        });
      } else {
        // Individual stop typing
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("user-stopped-typing", {
            from: data.from
          });
        }
      }
    } catch (error) {
      console.error("Error in stop-typing:", error);
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
