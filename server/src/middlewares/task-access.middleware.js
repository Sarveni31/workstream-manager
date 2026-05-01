import { StatusCodes } from "http-status-codes";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { assertValidTaskStatusForProject } from "../utils/project-task-helpers.js";

export const loadTask = async (req, _res, next) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId).populate(
    "project",
    "workflowStatuses completedStatuses status members admin name priority deadline tags visibility"
  );
  if (!task) {
    return next(new ApiError(StatusCodes.NOT_FOUND, "Task not found"));
  }
  if (!task.project) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "Task project not found"));
  }
  req.task = task;
  return next();
};

export const requireTaskAssigneeOrAdmin = (req, _res, next) => {
  if (req.user.role === "admin") return next();

  const isAssignee = req.task.assignedTo.toString() === req.user._id.toString();
  if (!isAssignee) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Only the assigned member can update task status"));
  }
  return next();
};

export const validateTaskStatusAgainstWorkflow = (req, _res, next) => {
  try {
    assertValidTaskStatusForProject(req.task.project, req.body.status);
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireProjectMemberOrAdminForTaskCreate = async (req, _res, next) => {
  const { projectId } = req.body;
  const project = await Project.findById(projectId).select(
    "members admin status workflowStatuses completedStatuses"
  );
  if (!project) {
    return next(new ApiError(StatusCodes.NOT_FOUND, "Project not found"));
  }

  if (project.status === "Archived") {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "Cannot create tasks in an archived project"));
  }

  if (req.user.role === "admin") {
    req.project = project;
    return next();
  }

  const isProjectMember = project.members.some((member) => member.toString() === req.user._id.toString());
  if (!isProjectMember) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "You can create tasks only in assigned projects"));
  }

  req.project = project;
  return next();
};
