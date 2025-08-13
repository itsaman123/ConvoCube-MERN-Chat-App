const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
const Group = require("./models/groupModel");
require("dotenv").config();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://convocube-chat.vercel.app', 'https://convo-cube-backend.vercel.app']
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB connection with better error handling
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err.message);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    message: 'Backend working fine',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ConvoCube Chat API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      messages: '/api/messages'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Only set up server and socket.io in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () =>
    console.log(`Server started on port ${PORT}`)
  );

  // Socket.io setup (only for non-serverless)
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3000",
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
}

// Export the app for Vercel
module.exports = app;
