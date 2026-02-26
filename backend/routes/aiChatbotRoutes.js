import { Router } from "express";
import { chatWithAI } from "../controllers/aiChatbotController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, chatWithAI);

export default router;