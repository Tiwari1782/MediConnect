import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.userId}`);

    // Track online user
    onlineUsers.set(socket.userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));

    // ─── JOIN CHAT ROOM ──────────────────────────
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    // ─── LEAVE CHAT ROOM ─────────────────────────
    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // ─── SEND MESSAGE ────────────────────────────
    socket.on("send-message", async (data) => {
      try {
        const { chatId, content, messageType, fileUrl, fileName, fileSize } =
          data;

        const message = await Message.create({
          chatId,
          sender: socket.userId,
          content: content || "",
          messageType: messageType || "text",
          fileUrl: fileUrl || "",
          fileName: fileName || "",
          fileSize: fileSize || 0,
        });

        // Update last message in chat
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "name avatar"
        );

        // Emit to all users in the chat room
        io.to(chatId).emit("new-message", populatedMessage);

        // Send notification to offline participants
        const chat = await Chat.findById(chatId);
        chat.participants.forEach((participantId) => {
          const id = participantId.toString();
          if (id !== socket.userId) {
            const recipientSocketId = onlineUsers.get(id);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("message-notification", {
                chatId,
                message: populatedMessage,
              });
            }
          }
        });
      } catch (error) {
        socket.emit("message-error", { error: error.message });
      }
    });

    // ─── TYPING INDICATORS ───────────────────────
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("user-typing", {
        chatId,
        userId: socket.userId,
      });
    });

    socket.on("stop-typing", (chatId) => {
      socket.to(chatId).emit("user-stop-typing", {
        chatId,
        userId: socket.userId,
      });
    });

    // ─── MESSAGE READ ────────────────────────────
    socket.on("mark-read", async ({ chatId, messageIds }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, sender: { $ne: socket.userId } },
          { isRead: true, readAt: new Date() }
        );
        socket.to(chatId).emit("messages-read", {
          chatId,
          messageIds,
          readBy: socket.userId,
        });
      } catch (error) {
        console.error("Mark read error:", error.message);
      }
    });

    // ─── DISCONNECT ──────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export { onlineUsers };
export default initializeSocket;