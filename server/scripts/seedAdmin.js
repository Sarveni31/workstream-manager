import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";

const getArgValue = (name) => {
  const key = `--${name}`;
  const index = process.argv.indexOf(key);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
};

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  const email = getArgValue("email");
  const password = getArgValue("password");
  const name = getArgValue("name") || "Demo Admin";

  if (!mongoUri) {
    throw new Error("MONGO_URI is required in environment");
  }
  if (!email || !password) {
    throw new Error("Usage: npm run seed:admin -- --email <email> --password <password> [--name <name>]");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  await mongoose.connect(mongoUri);

  let user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user) {
    user = new User({
      name,
      email,
      password,
      role: "admin"
    });
  } else {
    user.name = name;
    user.password = password;
    user.role = "admin";
  }

  await user.save();
  // eslint-disable-next-line no-console
  console.log(`Admin account ready: ${user.email}`);
};

run()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
