import { generateNanoId } from "../utils/helper";
import { saveShortUrl, getCustomShortUrl } from "../dao/url";

export const createShortUrlWithoutUser = async (
  url: string
): Promise<string> => {
  const shortUrl = generateNanoId(7);
  await saveShortUrl(shortUrl, url);
  return shortUrl;
};

export const createShortUrlWithUser = async (
  url: string,
  userId: string,
  slug?: string
): Promise<string> => {
  const shortUrl = slug || generateNanoId(7);

  if (slug) {
    const exists = await getCustomShortUrl(slug);
    if (exists) throw new Error("This custom URL already exists");
  }

  await saveShortUrl(shortUrl, url, userId);
  return shortUrl;
};
