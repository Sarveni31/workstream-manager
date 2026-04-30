import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    algorithm: "HS256"
  });

export const verifyToken = (token) =>
  jwt.verify(token, env.jwtSecret, {
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    algorithms: ["HS256"]
  });
