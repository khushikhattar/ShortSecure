import z from "zod";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../models/user.model";
const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.genAccessToken();
    const refreshToken = user.genRefreshToken();
    user.refreshToken.push(refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Error generating tokens: ${(error as Error).message}`);
  }
};
const registerSchema = z
  .object({
    name: z.string(),
    email: z.email(),
    address: z.string(),
    password: z.string().min(6),
    confirmpassword: z.string().min(6),
    username: z.string().min(8).max(12),
    avatar: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
  });

type registerPayload = z.infer<typeof registerSchema>;

const register = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      message: "Validation errors",
      errors: parseResult.error.issues,
    });
    return;
  }

  const data: registerPayload = parseResult.data;

  const existedUser = await User.findOne({
    $or: [{ username: data.username }, { email: data.email }],
  });

  if (existedUser) {
    res
      .status(409)
      .json({ message: "User with email or username already exists" });
    return;
  }

  const createdUser = await User.create({
    name: data.name,
    email: data.email,
    username: data.username,
    avatar: data.avatar ?? null,
    address: data.address,
    password: data.password,
    refreshToken: [],
  });
  if (!createdUser) {
    res.status(500).json({ message: "Error in creating the user" });
    return;
  }

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      username: createdUser.username,
    },
  });
});

const loginSchema = z
  .object({
    username: z.string().optional(),
    email: z.email().optional(),
    password: z.string(),
  })
  .refine((data) => data.email || data.username, {
    message: "Either username or email exists",
    path: ["username", "email"],
  });

type loginPayload = z.infer<typeof loginSchema>;
const login = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      message: "Validation errors",
      errors: parseResult.error.issues,
    });
    return;
  }
  const data: loginPayload = parseResult.data;
  const existingUser = await User.findOne({
    $or: [{ username: data.username }, { email: data.email }],
  });
  if (!existingUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const ispasswordCorrect = await existingUser.comparePassword(data.password);
  if (!ispasswordCorrect) {
    res.status(401).json({ message: "Invalid Password" });
    return;
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existingUser._id
  );
  const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "User Logged In Successfully",
      user: loggedInUser,
      token: accessToken,
    });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(400).json({ message: "No refresh token found" });
    return;
  }
  const user = await User.findOne({ refreshToken: { $in: [token] } });
  if (!user) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(204).json({ message: "User not found, but cookies cleared" });
    return;
  }
  user.refreshToken = user.refreshToken.filter((t) => t !== token);
  await user.save({ validateBeforeSave: false });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({ message: "Logged out from current device" });
});

const logoutAllDevices = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ message: "No refresh token found" });
    return;
  }
  const user = await User.findOne({ refreshToken: { $in: [refreshToken] } });
  if (!user) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(204).json({ message: "User not found, but cookies cleared" });
    return;
  }
  user.refreshToken = [];
  await user.save({ validateBeforeSave: false });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({ message: "Logged out from all devices" });
});
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  const user = await User.findOne({
    refreshToken: { $in: [oldRefreshToken] },
  });

  if (!user) {
    res.status(403).json({ message: "Invalid refresh token" });
    return;
  }

  try {
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string };

    if (decoded.id !== user._id) {
      res.status(403).json({ message: "Token user mismatch" });
      return;
    }
    user.refreshToken = user.refreshToken.filter((t) => t !== oldRefreshToken);

    const newAccessToken = user.genAccessToken();
    const newRefreshToken = user.genRefreshToken();

    user.refreshToken.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res
      .cookie("accessToken", newAccessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Refresh token expired or invalid" });
    return;
  }
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    return;
  }
});

export {
  register,
  login,
  logout,
  logoutAllDevices,
  getCurrentUser,
  refreshAccessToken,
};
