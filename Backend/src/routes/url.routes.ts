import { Router } from "express";
import {
  createShortUrl,
  redirectToLongUrl,
  getShortUrlStats,
  getMyShortUrls,
} from "../controllers/url.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { conditionalLimiter } from "../middlewares/rateLimiter";

const router = Router();
router.post("/shorten", conditionalLimiter, createShortUrl);
router.get("/s/:shortUrl", redirectToLongUrl);
router.get("/stats/:slug", getShortUrlStats);
router.get("/my", verifyUser, getMyShortUrls);

export default router;
