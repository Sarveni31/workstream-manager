import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
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

export const signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already in use");
  }

  // Role is intentionally not accepted from public signup.
  // Admin role should only be assigned manually by trusted operators.
  const user = await User.create({ name, email, password });
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
