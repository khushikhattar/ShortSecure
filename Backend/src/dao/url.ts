import { Url } from "../models/url.model";

export const saveShortUrl = async (
  shortUrl: string,
  longUrl: string,
  userId?: string
) => {
  try {
    const newUrl = new Url({
      full_url: longUrl,
      short_url: shortUrl,
      user: userId ?? undefined,
    });
    await newUrl.save();
  } catch (err: any) {
    if (err.code === 11000) {
      throw new Error("Short URL already exists");
    }
    throw new Error("Failed to save short URL");
  }
};

export const getShortUrl = async (shortUrl: string) => {
  return await Url.findOneAndUpdate(
    { short_url: shortUrl },
    { $inc: { clicks: 1 } }
  );
};

export const getCustomShortUrl = async (slug: string) => {
  return await Url.findOne({ short_url: slug });
};

export const getUrlStats = async (slug: string) => {
  return await Url.findOne({ short_url: slug }).select(
    "short_url full_url clicks createdAt"
  );
};
