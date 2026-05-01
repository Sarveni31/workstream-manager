import { StatusCodes } from "http-status-codes";
import { ApiError } from "./ApiError.js";

const DEFAULT_WORKFLOW = ["Todo", "In Progress", "Done"];
const DEFAULT_COMPLETED = ["Done"];

export const normalizedWorkflowStatuses = (projectDoc) =>
  Array.isArray(projectDoc?.workflowStatuses) && projectDoc.workflowStatuses.length
    ? [...new Set(projectDoc.workflowStatuses.map((s) => String(s).trim()).filter(Boolean))]
    : [...DEFAULT_WORKFLOW];

export const normalizedCompletedStatuses = (projectDoc, workflowStatuses) => {
  const workflow = workflowStatuses ?? normalizedWorkflowStatuses(projectDoc);
  const raw =
    Array.isArray(projectDoc?.completedStatuses) && projectDoc.completedStatuses.length
      ? projectDoc.completedStatuses
      : DEFAULT_COMPLETED.filter((status) => workflow.includes(status)).length > 0
        ? DEFAULT_COMPLETED.filter((status) => workflow.includes(status))
        : [workflow.at(-1)];

  return [...new Set(raw.map((s) => String(s).trim()).filter(Boolean))].filter((s) =>
    workflow.includes(s)
  );
};

export const assertValidTaskStatusForProject = (projectDoc, status) => {
  if (!projectDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Project context missing");
  }
  const workflow = normalizedWorkflowStatuses(projectDoc);
  if (!workflow.includes(status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid task status for this project. Allowed: ${workflow.join(", ")}`
    );
  }
};
