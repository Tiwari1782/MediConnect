import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:notificationId/read", protect, markAsRead);
router.delete("/:notificationId", protect, deleteNotification);

export default router;