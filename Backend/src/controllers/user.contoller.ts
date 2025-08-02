import z from "zod";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
const updateSchema = z.object({
  newusername: z.string().min(6).max(12).optional(),
  newemail: z.email().optional(),
  newavatar: z.string().optional(),
  newname: z.string().optional(),
});

type UpdatePayload = z.infer<typeof updateSchema>;

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "No fields provided to update" });
    return;
  }
  const parseResult = updateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      message: "Validation errors",
      errors: parseResult.error.issues,
    });
    return;
  }

  if (!req.user || !req.user.id) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const { newusername, newemail, newavatar, newname }: UpdatePayload =
    parseResult.data;
  type UserDBFields = "username" | "email" | "avatar" | "name";
  const updateFields: Partial<Record<UserDBFields, string>> = {};
  if (newusername) updateFields.username = newusername;
  if (newemail) updateFields.email = newemail;
  if (newavatar) updateFields.avatar = newavatar;
  if (newname) updateFields.name = newname;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

const updatePasswordSchema = z.object({
  oldpassword: z.string().min(6),
  newpassword: z.string().min(6),
});

type UpdatePasswordPayload = z.infer<typeof updatePasswordSchema>;

const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = updatePasswordSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      message: "Validation errors",
      errors: parseResult.error.issues,
    });
    return;
  }

  if (!req.user || !req.user.id) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  const { oldpassword, newpassword }: UpdatePasswordPayload = parseResult.data;

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const isPasswordValid = await user.comparePassword(oldpassword);
  if (!isPasswordValid) {
    res.status(400).json({ message: "Invalid current password" });
    return;
  }

  const hashedPassword = await bcrypt.hash(newpassword, 10);
  user.password = hashedPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: "Password changed successfully" });
});

const fetchAllUrl = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  const allUrls = await User.findById(req.user.id).populate("urlList");
  res.status(200).json({ userUrls: allUrls?.urlList || [] });
});
export { updateUser, updatePassword, fetchAllUrl };
