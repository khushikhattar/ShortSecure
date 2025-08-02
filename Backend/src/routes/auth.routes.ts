import { Router } from "express";
import {
  register,
  login,
  logout,
  logoutAllDevices,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/auth.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.route("/logout").post(verifyUser, logout);
router.route("/logout-all").post(verifyUser, logoutAllDevices);
router.route("/refresh").post(refreshAccessToken);
router.route("/me").get(verifyUser, getCurrentUser);

export default router;
