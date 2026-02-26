import { Router } from "express";
import {
  requestAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getMyAppointments,
  getAppointmentById,
} from "../controllers/appointmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  requestAppointment
);
router.get("/my", protect, getMyAppointments);
router.get("/:appointmentId", protect, getAppointmentById);
router.put(
  "/:appointmentId/status",
  protect,
  authorizeRoles("doctor"),
  updateAppointmentStatus
);
router.put(
  "/:appointmentId/cancel",
  protect,
  authorizeRoles("patient"),
  cancelAppointment
);

export default router;