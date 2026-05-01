import { body } from "express-validator";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;
const PASSWORD_HINT =
  "Password must be 8-64 chars and include uppercase, lowercase, number, and special character";

export const signupValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").matches(PASSWORD_RULE).withMessage(PASSWORD_HINT),
  body("role")
    .not()
    .exists()
    .withMessage("Role cannot be set during signup"),
  body("adminCode").optional().isString().trim().isLength({ min: 8 }).withMessage("Invalid admin code")
];

export const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];
