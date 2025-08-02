import { customAlphabet } from "nanoid";

export const generateNanoId = (length: number): string => {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};
