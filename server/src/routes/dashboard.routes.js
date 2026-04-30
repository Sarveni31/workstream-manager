import { Router } from "express";
import { getOverdueTasks, getTaskSummary, getUserTasks } from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/all-tasks", getUserTasks);
router.get("/overdue-tasks", getOverdueTasks);
router.get("/summary", getTaskSummary);

export default router;
