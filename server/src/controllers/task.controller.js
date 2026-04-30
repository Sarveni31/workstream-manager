import { StatusCodes } from "http-status-codes";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(StatusCodes.NOT_FOUND, "Project not found");
  if (userId.role === "admin") return project;
  const memberIds = project.members.map((member) => member.toString());
  if (!memberIds.includes(userId._id.toString())) {
    throw new ApiError(StatusCodes.FORBIDDEN, "No access to project");
  }
  return project;
};

export const createTask = catchAsync(async (req, res) => {
  const { title, description, projectId, assignedTo, status, deadline } = req.body;
  const project = await ensureProjectAccess(projectId, req.user);

  const isAssigneeInProject = project.members.some((member) => member.toString() === assignedTo);
  if (!isAssigneeInProject) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Assigned user must be a member of the project");
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    createdBy: req.user._id,
    status: status || "Todo",
    deadline
  });
  res.status(StatusCodes.CREATED).json({ task });
});

export const getTasks = catchAsync(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
  const tasks = await Task.find(query)
    .populate("project", "name")
    .populate("assignedTo", "name email")
    .sort({ deadline: 1 });
  res.status(StatusCodes.OK).json({ tasks });
});

export const updateTaskStatus = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const task = await Task.findById(taskId).populate("project");
  if (!task) throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");

  const isAssignee = task.assignedTo.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isAdmin && !isAssignee) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only the assigned member can update task status");
  }

  task.status = status;
  await task.save();
  res.status(StatusCodes.OK).json({ task });
});
