import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";

export const notFound = (_req, _res, next) => {
  const error = new Error("Route not found");
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    details: err.details || null,
    ...(env.nodeEnv !== "production" && { stack: err.stack })
  });
};
