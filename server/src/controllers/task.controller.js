import { StatusCodes } from "http-status-codes";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  assertValidTaskStatusForProject,
  normalizedWorkflowStatuses
} from "../utils/project-task-helpers.js";

export const createTask = catchAsync(async (req, res) => {
  const { title, description, projectId, assignedTo, status, priority, deadline } = req.body;
  const projectDoc = req.project;

  const isAssigneeInProject = projectDoc.members.some((member) => member.toString() === assignedTo);
  if (!isAssigneeInProject) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Assigned user must be a member of the project");
  }

  const workflow = normalizedWorkflowStatuses(projectDoc);
  const initialStatus = status || workflow[0];
  assertValidTaskStatusForProject(projectDoc, initialStatus);

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    createdBy: req.user._id,
    status: initialStatus,
    priority: priority || "medium",
    deadline
  });
  res.status(StatusCodes.CREATED).json({ task });
});

export const getTasks = catchAsync(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
  const tasks = await Task.find(query)
    .populate("project", "name status workflowStatuses completedStatuses priority deadline tags visibility")
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

export const updateTaskByAdmin = catchAsync(async (req, res) => {
  const { title, description, assignedTo, status, priority, deadline } = req.body;
  const task = req.task;
  const projectDoc = task.project;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : task.deadline;

  if (assignedTo !== undefined) {
    const inProject = projectDoc.members.some((m) => m.toString() === assignedTo);
    if (!inProject) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Assignee must be a project member");
    }
    task.assignedTo = assignedTo;
  }

  if (status !== undefined) {
    assertValidTaskStatusForProject(projectDoc, status);
    task.status = status;
  }

  await task.save();
  const updated = await Task.findById(task._id)
    .populate("project", "name workflowStatuses completedStatuses")
    .populate("assignedTo", "name email");
  res.status(StatusCodes.OK).json({ task: updated });
});

export const deleteTask = catchAsync(async (req, res) => {
  await Task.findByIdAndDelete(req.task._id);
  res.status(StatusCodes.NO_CONTENT).send();
});
