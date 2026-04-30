import { StatusCodes } from "http-status-codes";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createTask = catchAsync(async (req, res) => {
  const { title, description, projectId, assignedTo, status, deadline } = req.body;
  const project = req.project;

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
  const { status } = req.body;
  const task = req.task;

  task.status = status;
  await task.save();
  res.status(StatusCodes.OK).json({ task });
});
