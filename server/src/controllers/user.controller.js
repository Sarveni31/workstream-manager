import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getUsers = catchAsync(async (_req, res) => {
  const users = await User.find({}).select("name email role").sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ users });
});
