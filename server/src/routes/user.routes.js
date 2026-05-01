import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/", getUsers);

export default router;
