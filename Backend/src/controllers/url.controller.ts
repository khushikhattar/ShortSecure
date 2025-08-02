import { Request, Response } from "express";
import { z } from "zod";
import asyncHandler from "express-async-handler";
import { nanoid } from "nanoid";
import { Url } from "../models/url.model";
import { User } from "../models/user.model";

const createShortUrlSchema = z.object({
  long_url: z.string().url("Invalid URL format"),
});

const shortUrlParamSchema = z.object({
  shortUrl: z.string().min(5).max(15, "Invalid short URL"),
});

const slugParamSchema = z.object({
  slug: z.string().min(5).max(15, "Invalid slug format"),
});
type CreateShortUrlPayload = z.infer<typeof createShortUrlSchema>;
export const createShortUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = createShortUrlSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.issues,
      });
      return;
    }

    const { long_url }: CreateShortUrlPayload = parseResult.data;

    const short_url = nanoid(7);

    const newUrl = await Url.create({
      long_url,
      short_url,
      user_id: req.user?.id || undefined,
    });

    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: { urlList: newUrl._id },
      });
    }

    res.status(201).json({
      message: "Short URL created",
      short_url: newUrl.short_url,
      long_url: newUrl.long_url,
      clicks: newUrl.clicks,
    });
  }
);

export const redirectToLongUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = shortUrlParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid short URL format" });
      return;
    }

    const { shortUrl } = parsed.data;

    const urlEntry = await Url.findOne({ short_url: shortUrl });
    if (!urlEntry) {
      res.status(404).json({ message: "Short URL not found" });
      return;
    }

    urlEntry.clicks += 1;
    await urlEntry.save();

    res.redirect(urlEntry.long_url);
  }
);

export const getShortUrlStats = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = slugParamSchema.safeParse(req.params);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation errors",
        error: parseResult.error.issues,
      });
      return;
    }

    const { slug } = parseResult.data;
    const stats = await Url.findOne({ short_url: slug });

    if (!stats) {
      res.status(404).json({ error: "Short URL not found" });
      return;
    }

    res.status(200).json({
      short_url: stats.short_url,
      long_url: stats.long_url,
      clicks: stats.clicks,
      createdAt: stats.createdAt,
    });
  }
);

export const getMyShortUrls = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const urls = await Url.find({ user_id: req.user.id });
    res.status(200).json({ urls });
  }
);
