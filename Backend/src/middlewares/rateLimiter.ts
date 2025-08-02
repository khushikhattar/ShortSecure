import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

const strictAnonymousLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: "Too many requests from anonymous user",
  },
  keyGenerator: (req: Request): string => req.ip || "unknown",
});

export const conditionalLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return strictAnonymousLimiter(req, res, next);
  }
  return next();
};
