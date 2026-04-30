import { StatusCodes } from "http-status-codes";
import { Project } from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";

export const loadProject = async (req, _res, next) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ApiError(StatusCodes.NOT_FOUND, "Project not found"));
  }

  req.project = project;
  return next();
};

export const requireProjectAdmin = (req, _res, next) => {
  if (req.user.role === "admin") {
    return next();
  }

  return next(new ApiError(StatusCodes.FORBIDDEN, "Only admins can perform this action"));
};

export const requireProjectMember = (req, _res, next) => {
  if (req.user.role === "admin") {
    return next();
  }

  const memberIds = req.project.members.map((member) => member.toString());
  const isMember = memberIds.includes(req.user._id.toString());

  if (!isMember) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Only project members can view this project"));
  }

  return next();
};
