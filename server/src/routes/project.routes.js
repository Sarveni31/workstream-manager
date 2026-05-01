import { Router } from "express";
import {
  addProjectMember,
  createProject,
  getProjectById,
  getProjects,
  removeProjectMember,
  updateProject
} from "../controllers/project.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  loadProject,
  requireProjectAdmin,
  requireProjectMember
} from "../middlewares/project-access.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProjectValidator,
  projectIdValidator,
  projectMemberValidator,
  updateProjectValidator
} from "../validators/project.validator.js";

const router = Router();

router.use(protect);

router.post("/", authorize("admin"), createProjectValidator, validate, createProject);
router.get("/", getProjects);
router.get("/:projectId", projectIdValidator, validate, loadProject, requireProjectMember, getProjectById);
router.patch(
  "/:projectId",
  authorize("admin"),
  projectIdValidator,
  updateProjectValidator,
  validate,
  loadProject,
  requireProjectAdmin,
  updateProject
);
router.patch(
  "/:projectId/members/add",
  authorize("admin"),
  projectIdValidator,
  projectMemberValidator,
  validate,
  loadProject,
  requireProjectAdmin,
  addProjectMember
);
router.patch(
  "/:projectId/members/remove",
  authorize("admin"),
  projectIdValidator,
  projectMemberValidator,
  validate,
  loadProject,
  requireProjectAdmin,
  removeProjectMember
);

export default router;
