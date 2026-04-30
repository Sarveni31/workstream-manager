import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginValidator, signupValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, me);

export default router;
