import { Router } from "express";
import {
  sendMessage,
  getMessages,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadChatFile } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post("/", protect, uploadChatFile.single("file"), sendMessage);
router.get("/:chatId", protect, getMessages);

export default router;