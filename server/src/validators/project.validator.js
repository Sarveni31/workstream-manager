import { body, param } from "express-validator";

export const createProjectValidator = [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().isString(),
  body("members").optional().isArray().withMessage("members must be an array"),
  body("members.*").optional().isMongoId().withMessage("Each member id must be valid")
];

export const projectIdValidator = [param("projectId").isMongoId().withMessage("Invalid project id")];

export const projectMemberValidator = [
  body("userId").isMongoId().withMessage("Valid userId is required")
];
