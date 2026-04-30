import dotenv from "dotenv";

dotenv.config();

const required = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_EXPIRES_IN", "CLIENT_URL"];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtIssuer: process.env.JWT_ISSUER || "team-task-manager-api",
  jwtAudience: process.env.JWT_AUDIENCE || "team-task-manager-client",
  clientUrl: process.env.CLIENT_URL,
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",
  nodeEnv: process.env.NODE_ENV || "development"
};
