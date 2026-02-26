import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";

// DB connection
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiChatbotRoutes from "./routes/aiChatbotRoutes.js";
import nearbyPlacesRoutes from "./routes/nearbyPlacesRoutes.js";

// Middlewares
import errorHandler from "./middlewares/errorHandler.js";

// Socket
import initializeSocket from "./socket/socketServer.js";
import initializeWebRTC from "./socket/webrtcSignaling.js";

// Initialize Express
const app = express();
const server = http.createServer(app);

// ─── GLOBAL MIDDLEWARES ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── API ROUTES ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai-chatbot", aiChatbotRoutes);
app.use("/api/nearby-places", nearbyPlacesRoutes);

// ─── HEALTH CHECK ────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediConnect API is running! 🏥",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});
// ─── ERROR HANDLER ───────────────────────────────────────────────
app.use(errorHandler);

// ─── INITIALIZE SOCKET.IO ────────────────────────────────────────
const io = initializeSocket(server);
initializeWebRTC(io);

// ─── START SERVER ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                            ║
    ║   🏥 MediConnect Backend Server           ║
    ║   🚀 Running on port ${PORT}              ║
    ║   📡 Socket.IO ready                      ║
    ║   🎥 WebRTC signaling ready               ║
    ║   🌍 Environment: ${process.env.NODE_ENV || "development"}          ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    `);
  });
});

export { io };