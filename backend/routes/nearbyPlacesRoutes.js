import { Router } from "express";
import { getNearbyPlaces } from "../controllers/nearbyPlacesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, getNearbyPlaces);

export default router;