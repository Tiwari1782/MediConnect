import { Router } from "express";
import {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorDashboard,
} from "../controllers/doctorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", getAllDoctors);
router.get("/dashboard", protect, authorizeRoles("doctor"), getDoctorDashboard);
router.get("/:id", getDoctorById);
router.put(
  "/profile",
  protect,
  authorizeRoles("doctor"),
  updateDoctorProfile
);

export default router;