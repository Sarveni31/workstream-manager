import { Router } from "express";
import { createTask, getTasks, updateTaskStatus } from "../controllers/task.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTaskValidator, updateTaskStatusValidator } from "../validators/task.validator.js";

const router = Router();

router.use(protect);

router.post("/", authorize("admin"), createTaskValidator, validate, createTask);
router.get("/", getTasks);
router.patch(
  "/:taskId/status",
  authorize("admin", "member"),
  updateTaskStatusValidator,
  validate,
  updateTaskStatus
);

export default router;
