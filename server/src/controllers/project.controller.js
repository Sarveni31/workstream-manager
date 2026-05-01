import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

export const createProject = catchAsync(async (req, res) => {
  const {
    name,
    description,
    members = [],
    status,
    priority,
    deadline,
    tags,
    visibility,
    workflowStatuses,
    completedStatuses
  } = req.body;
  const uniqueMembers = [...new Set([req.user._id.toString(), ...members])].map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const project = await Project.create({
    name,
    description,
    admin: req.user._id,
    members: uniqueMembers,
    status: status || "Active",
    priority: priority || "medium",
    deadline: deadline ?? null,
    tags: Array.isArray(tags) ? tags : [],
    visibility: visibility || "team",
    workflowStatuses: Array.isArray(workflowStatuses) ? workflowStatuses : undefined,
    completedStatuses: Array.isArray(completedStatuses) ? completedStatuses : undefined
  });

  res.status(StatusCodes.CREATED).json({ project });
});

export const getProjects = catchAsync(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { members: { $in: [req.user._id] } };
  const projects = await Project.find(query).populate("members admin", "name email role");
  res.status(StatusCodes.OK).json({ projects });
});

export const getProjectById = catchAsync(async (req, res) => {
  const project = await req.project.populate("members admin", "name email role");
  res.status(StatusCodes.OK).json({ project });
});

export const updateProject = catchAsync(async (req, res) => {
  const {
    description,
    status,
    priority,
    deadline,
    tags,
    visibility,
    workflowStatuses,
    completedStatuses
  } = req.body;
  const project = req.project;

  if (typeof description === "string") project.description = description;
  if (status) project.status = status;
  if (priority) project.priority = priority;
  if (deadline !== undefined) project.deadline = deadline ?? null;
  if (Array.isArray(tags)) project.tags = tags;
  if (visibility) project.visibility = visibility;
  if (Array.isArray(workflowStatuses)) project.workflowStatuses = workflowStatuses;
  if (Array.isArray(completedStatuses)) project.completedStatuses = completedStatuses;

  await project.save();
  res.status(StatusCodes.OK).json({ project });
});

export const addProjectMember = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const project = req.project;
  if (!project.members.some((id) => id.toString() === userId)) {
    project.members.push(userId);
    await project.save();
  }
  res.status(StatusCodes.OK).json({ project });
});

export const removeProjectMember = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const project = req.project;

  if (project.admin.toString() === userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Project admin cannot be removed from members");
  }

  project.members = project.members.filter((id) => id.toString() !== userId);
  await project.save();

  res.status(StatusCodes.OK).json({ project });
});
