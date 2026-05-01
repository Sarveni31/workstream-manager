import { body, param } from "express-validator";

export const createProjectValidator = [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().isString(),
  body("members").optional().isArray().withMessage("members must be an array"),
  body("members.*").optional().isMongoId().withMessage("Each member id must be valid"),
  body("status").optional().isIn(["Active", "Archived"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("deadline").optional({ nullable: true }).isISO8601(),
  body("tags").optional().isArray(),
  body("tags.*").optional().isString().trim().isLength({ max: 40 }),
  body("visibility").optional().isIn(["team", "private"]),
  body("workflowStatuses").optional().isArray(),
  body("workflowStatuses.*").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("completedStatuses").optional().isArray(),
  body("completedStatuses.*").optional().isString().trim().isLength({ min: 1, max: 80 })
];

export const projectIdValidator = [param("projectId").isMongoId().withMessage("Invalid project id")];

export const projectMemberValidator = [
  body("userId").isMongoId().withMessage("Valid userId is required")
];

export const updateProjectValidator = [
  body("description").optional().isString(),
  body("status").optional().isIn(["Active", "Archived"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("deadline").optional({ nullable: true }).isISO8601(),
  body("tags").optional().isArray(),
  body("tags.*").optional().isString().trim().isLength({ max: 40 }),
  body("visibility").optional().isIn(["team", "private"]),
  body("workflowStatuses").optional().isArray({ min: 2, max: 50 }),
  body("workflowStatuses.*").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("completedStatuses").optional().isArray({ max: 20 }),
  body("completedStatuses.*").optional().isString().trim().isLength({ min: 1, max: 80 })
];
