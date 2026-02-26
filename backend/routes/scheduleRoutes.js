import { Router } from "express";
import {
  upsertSchedule,
  getDoctorSchedule,
  getMySchedule,
  deleteSchedule,
  toggleScheduleStatus,
} from "../controllers/scheduleController.js";
import { protect } from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

router.post("/", protect, authorizeRoles("doctor"), upsertSchedule);
router.get("/my", protect, authorizeRoles("doctor"), getMySchedule);
router.get("/doctor/:doctorId", getDoctorSchedule);
router.delete("/:scheduleId", protect, authorizeRoles("doctor"), deleteSchedule);
router.patch(
  "/:scheduleId/toggle",
  protect,
  authorizeRoles("doctor"),
  toggleScheduleStatus
);

export default router;