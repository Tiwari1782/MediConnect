import { Router } from "express";
import {
  searchMedicines,
  getMedicineById,
  addMedicine,
} from "../controllers/medicineController.js";
import { protect } from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", searchMedicines);
router.get("/:id", getMedicineById);
router.post("/", protect, authorizeRoles("doctor"), addMedicine);

export default router;