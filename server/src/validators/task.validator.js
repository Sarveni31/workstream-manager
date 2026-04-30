import { body, param } from "express-validator";

export const createTaskValidator = [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("description").optional().isString(),
  body("projectId").isMongoId().withMessage("Valid projectId is required"),
  body("assignedTo").isMongoId().withMessage("Valid assignedTo user id is required"),
  body("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status"),
  body("deadline").isISO8601().withMessage("Valid deadline is required")
];

export const updateTaskStatusValidator = [
  param("taskId").isMongoId().withMessage("Invalid task id"),
  body("status").isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status")
];
