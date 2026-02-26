import { Router } from "express";
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientDashboard,
} from "../controllers/patientController.js";
import { protect } from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

router.get(
  "/profile",
  protect,
  authorizeRoles("patient"),
  getPatientProfile
);
router.put(
  "/profile",
  protect,
  authorizeRoles("patient"),
  updatePatientProfile
);
router.get(
  "/dashboard",
  protect,
  authorizeRoles("patient"),
  getPatientDashboard
);

export default router;