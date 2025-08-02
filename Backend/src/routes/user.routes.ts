import { Router } from "express";
import {
  updateUser,
  updatePassword,
  fetchAllUrl,
} from "../controllers/user.contoller";
import { verifyUser } from "../middlewares/auth.middleware";
const router = Router();
router.patch("/update", verifyUser, updateUser);
router.patch("/update-password", verifyUser, updatePassword);
router.get("/urls", verifyUser, fetchAllUrl);
export default router;
