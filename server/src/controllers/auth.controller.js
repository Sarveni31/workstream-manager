import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { signToken } from "../utils/jwt.js";

const buildAuthResponse = (user) => ({
  token: signToken({ sub: user._id.toString(), role: user.role }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

const isValidAdminCode = (inputCode) => {
  const expected = env.adminInviteCode;
  if (!expected || !inputCode) return false;
  const inputBuffer = Buffer.from(inputCode);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
};

export const signup = catchAsync(async (req, res) => {
  const { name, email, password, adminCode } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already in use");
  }

  let role = "member";
  if (adminCode) {
    if (!env.adminInviteCode) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Admin signup is not enabled");
    }
    if (!isValidAdminCode(adminCode)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Invalid admin invite code");
    }
    role = "admin";
  }

  const user = await User.create({ name, email, password, role });
  res.status(StatusCodes.CREATED).json(buildAuthResponse(user));
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  res.status(StatusCodes.OK).json(buildAuthResponse(user));
});

export const me = catchAsync(async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
});
