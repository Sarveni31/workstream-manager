import { body, param } from "express-validator";

export const createTaskValidator = [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("description").optional().isString(),
  body("projectId").isMongoId().withMessage("Valid projectId is required"),
  body("assignedTo").isMongoId().withMessage("Valid assignedTo user id is required"),
  body("status").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("deadline").isISO8601().withMessage("Valid deadline is required")
];

export const updateTaskStatusValidator = [
  param("taskId").isMongoId().withMessage("Invalid task id"),
  body("status").isString().trim().isLength({ min: 1, max: 80 }).withMessage("Invalid status")
];

export const adminUpdateTaskValidator = [
  param("taskId").isMongoId().withMessage("Invalid task id"),
  body("title").optional().trim().notEmpty(),
  body("description").optional().isString(),
  body("assignedTo").optional().isMongoId(),
  body("status").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("deadline").optional().isISO8601()
];
