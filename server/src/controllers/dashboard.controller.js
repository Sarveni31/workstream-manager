import { StatusCodes } from "http-status-codes";
import { Task } from "../models/Task.js";
import { catchAsync } from "../utils/catchAsync.js";

const getTaskScope = (user) => (user.role === "admin" ? {} : { assignedTo: user._id });

export const getUserTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find(getTaskScope(req.user))
    .select("title description status assignedTo project deadline createdAt updatedAt")
    .populate("project", "name")
    .populate("assignedTo", "name email")
    .sort({ deadline: 1 })
    .lean();

  res.status(StatusCodes.OK).json({ tasks });
});

export const getOverdueTasks = catchAsync(async (req, res) => {
  const overdueTasks = await Task.find({
    ...getTaskScope(req.user),
    status: { $ne: "Done" },
    deadline: { $lt: new Date() }
  })
    .select("title description status assignedTo project deadline createdAt updatedAt")
    .populate("project", "name")
    .populate("assignedTo", "name email")
    .sort({ deadline: 1 })
    .lean();

  res.status(StatusCodes.OK).json({ overdueTasks });
});

export const getTaskSummary = catchAsync(async (req, res) => {
  const baseQuery = getTaskScope(req.user);
  const now = new Date();

  const [statusCounts, overdue] = await Promise.all([
    Task.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Task.countDocuments({
      ...baseQuery,
      status: { $ne: "Done" },
      deadline: { $lt: now }
    })
  ]);

  const summary = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue
  };

  statusCounts.forEach(({ _id, count }) => {
    summary.total += count;
    if (_id === "Todo") summary.todo = count;
    if (_id === "In Progress") summary.inProgress = count;
    if (_id === "Done") summary.done = count;
  });

  res.status(StatusCodes.OK).json({ summary });
});
