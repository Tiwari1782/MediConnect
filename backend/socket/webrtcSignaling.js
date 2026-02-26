/**
 * WebRTC Signaling - attach to existing Socket.IO instance
 */
const initializeWebRTC = (io) => {
  const activeRooms = new Map(); // roomId -> Set of userIds

  io.on("connection", (socket) => {
    // ─── JOIN VIDEO ROOM ────────────────────────
    socket.on("join-video-room", ({ roomId, userId, userName }) => {
      socket.join(`video-${roomId}`);

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set());
      }
      activeRooms.get(roomId).add(userId);

      // Notify others in the room
      socket.to(`video-${roomId}`).emit("user-joined-video", {
        userId,
        userName,
        socketId: socket.id,
      });

      // Send existing participants to the new user
      const participants = Array.from(activeRooms.get(roomId)).filter(
        (id) => id !== userId
      );
      socket.emit("existing-participants", { roomId, participants });

      console.log(`📹 ${userName} joined video room: ${roomId}`);
    });

    // ─── WEBRTC OFFER ───────────────────────────
    socket.on("webrtc-offer", ({ roomId, offer, to }) => {
      io.to(to).emit("webrtc-offer", {
        offer,
        from: socket.id,
        userId: socket.userId,
      });
    });

    // ─── WEBRTC ANSWER ──────────────────────────
    socket.on("webrtc-answer", ({ roomId, answer, to }) => {
      io.to(to).emit("webrtc-answer", {
        answer,
        from: socket.id,
        userId: socket.userId,
      });
    });

    // ─── ICE CANDIDATE ──────────────────────────
    socket.on("ice-candidate", ({ roomId, candidate, to }) => {
      io.to(to).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    });

    // ─── TOGGLE MEDIA ───────────────────────────
    socket.on("toggle-media", ({ roomId, type, enabled }) => {
      socket.to(`video-${roomId}`).emit("user-toggled-media", {
        userId: socket.userId,
        type, // "audio" or "video"
        enabled,
      });
    });

    // ─── SCREEN SHARE ───────────────────────────
    socket.on("screen-share-started", ({ roomId }) => {
      socket.to(`video-${roomId}`).emit("user-screen-sharing", {
        userId: socket.userId,
        sharing: true,
      });
    });

    socket.on("screen-share-stopped", ({ roomId }) => {
      socket.to(`video-${roomId}`).emit("user-screen-sharing", {
        userId: socket.userId,
        sharing: false,
      });
    });

    // ─── LEAVE VIDEO ROOM ───────────────────────
    socket.on("leave-video-room", ({ roomId, userId }) => {
      socket.leave(`video-${roomId}`);

      if (activeRooms.has(roomId)) {
        activeRooms.get(roomId).delete(userId);
        if (activeRooms.get(roomId).size === 0) {
          activeRooms.delete(roomId);
        }
      }

      socket.to(`video-${roomId}`).emit("user-left-video", {
        userId,
        socketId: socket.id,
      });

      console.log(`📹 User left video room: ${roomId}`);
    });

    // ─── CLEANUP ON DISCONNECT ──────────────────
    socket.on("disconnect", () => {
      activeRooms.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(`video-${roomId}`).emit("user-left-video", {
            userId: socket.userId,
            socketId: socket.id,
          });
          if (users.size === 0) {
            activeRooms.delete(roomId);
          }
        }
      });
    });
  });
};

export default initializeWebRTC;