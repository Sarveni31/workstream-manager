import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskByAdmin,
  updateTaskStatus
} from "../controllers/task.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  loadTask,
  requireProjectMemberOrAdminForTaskCreate,
  requireTaskAssigneeOrAdmin,
  validateTaskStatusAgainstWorkflow
} from "../middlewares/task-access.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  adminUpdateTaskValidator,
  createTaskValidator,
  updateTaskStatusValidator
} from "../validators/task.validator.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("admin", "member"),
  createTaskValidator,
  validate,
  requireProjectMemberOrAdminForTaskCreate,
  createTask
);
router.get("/", getTasks);

router.patch(
  "/:taskId/status",
  authorize("admin", "member"),
  updateTaskStatusValidator,
  validate,
  loadTask,
  validateTaskStatusAgainstWorkflow,
  requireTaskAssigneeOrAdmin,
  updateTaskStatus
);

router.patch(
  "/:taskId",
  authorize("admin"),
  adminUpdateTaskValidator,
  validate,
  loadTask,
  updateTaskByAdmin
);

router.delete("/:taskId", authorize("admin"), loadTask, deleteTask);

export default router;
