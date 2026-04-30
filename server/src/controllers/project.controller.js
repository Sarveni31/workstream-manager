import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

export const createProject = catchAsync(async (req, res) => {
  const { name, description, members = [] } = req.body;
  const uniqueMembers = [...new Set([req.user._id.toString(), ...members])].map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const project = await Project.create({
    name,
    description,
    admin: req.user._id,
    members: uniqueMembers
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
