import { Router } from "express";
import { accessChat, getMyChats } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, accessChat);
router.get("/", protect, getMyChats);

export default router;