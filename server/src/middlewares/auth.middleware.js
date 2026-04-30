import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
  }

  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid authentication token"));
    }
    req.user = user;
    return next();
  } catch {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Insufficient permissions"));
  }
  return next();
};
