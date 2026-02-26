import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  refundPayment,
  getPaymentDetails,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

router.post("/create-order", protect, authorizeRoles("patient"), createOrder);
router.post("/verify", protect, verifyPayment);
router.post(
  "/refund/:paymentId",
  protect,
  authorizeRoles("doctor"),
  refundPayment
);
router.get("/:paymentId", protect, getPaymentDetails);

export default router;