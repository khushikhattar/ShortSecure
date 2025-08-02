import { Router } from "express";
import authRoutes from "./auth.routes";
import urlRoutes from "./url.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/url", urlRoutes);
router.use("/user", userRoutes);

export default router;
