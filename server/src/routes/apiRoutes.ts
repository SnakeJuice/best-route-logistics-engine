import { Router } from "express";
import { getOrders, createOrder } from "../controllers/orderController";
import { getVehicles } from "../controllers/vehicleController";
import { createOptimizedRoute } from "../controllers/routeController";

const router = Router();

// Order routes
router.get("/orders", getOrders);
router.post("/orders", createOrder);

// Vehicle routes
router.get("/vehicles", getVehicles);

// Route Optimization routes
router.post("/routes/optimize", createOptimizedRoute);

export default router;
