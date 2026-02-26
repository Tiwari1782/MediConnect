import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  refreshAccessToken,
  getMyProfile,
  updateAvatar,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadAvatar } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/send-otp", sendPhoneOtp);
router.post("/verify-otp", verifyPhoneOtp);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", protect, getMyProfile);
router.put("/avatar", protect, uploadAvatar.single("avatar"), updateAvatar);

export default router;