import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

const getTaskScopeFilter = (user) =>
  user.role === "admin" ? {} : { assignedTo: new mongoose.Types.ObjectId(user._id) };

/** Adds isCompleted flag using each task's project's completedStatuses (default Done). */
const taskWithCompletionStages = () => [
  {
    $lookup: {
      from: "projects",
      localField: "project",
      foreignField: "_id",
      as: "proj"
    }
  },
  { $unwind: { path: "$proj", preserveNullAndEmptyArrays: true } },
  {
    $addFields: {
      completedStatuses: { $ifNull: ["$proj.completedStatuses", ["Done"]] },
      workflowStatuses: { $ifNull: ["$proj.workflowStatuses", ["Todo", "In Progress", "Done"]] }
    }
  },
  {
    $addFields: {
      isCompleted: {
        $cond: [{ $in: ["$status", "$completedStatuses"] }, true, false]
      }
    }
  }
];

export const getUserTasks = catchAsync(async (req, res) => {
  const match = getTaskScopeFilter(req.user);
  const tasks = await Task.aggregate([
    { $match: match },
    ...taskWithCompletionStages(),
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        status: 1,
        priority: 1,
        deadline: 1,
        assignedTo: 1,
        project: 1,
        createdAt: 1,
        updatedAt: 1,
        projectName: "$proj.name",
        workflowStatuses: 1,
        completedStatuses: 1
      }
    },
    { $sort: { deadline: 1 } }
  ]);

  const assignees = [...new Set(tasks.map((t) => t.assignedTo?.toString()).filter(Boolean))].map((id) =>
    new mongoose.Types.ObjectId(id)
  );
  const assigneeDocs = assignees.length
    ? await User.find({ _id: { $in: assignees } }).select("name email").lean()
    : [];

  const byId = Object.fromEntries(assigneeDocs.map((u) => [u._id.toString(), u]));

  const shaped = tasks.map((t) => ({
    _id: t._id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    deadline: t.deadline,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    project: t.project
      ? {
          _id: t.project,
          name: t.projectName,
          workflowStatuses: t.workflowStatuses,
          completedStatuses: t.completedStatuses
        }
      : null,
    assignedTo: t.assignedTo ? byId[t.assignedTo.toString()] || { _id: t.assignedTo } : null
  }));

  res.status(StatusCodes.OK).json({ tasks: shaped });
});

export const getOverdueTasks = catchAsync(async (req, res) => {
  const match = getTaskScopeFilter(req.user);
  const now = new Date();

  const overdueTasks = await Task.aggregate([
    { $match: match },
    ...taskWithCompletionStages(),
    {
      $match: {
        isCompleted: false,
        deadline: { $lt: now }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        status: 1,
        deadline: 1,
        assignedTo: 1,
        project: 1,
        createdAt: 1,
        projectName: "$proj.name"
      }
    },
    { $sort: { deadline: 1 } }
  ]);

  const assignees = [...new Set(overdueTasks.map((t) => t.assignedTo?.toString()).filter(Boolean))].map(
    (id) => new mongoose.Types.ObjectId(id)
  );
  const assigneeDocs = assignees.length
    ? await User.find({ _id: { $in: assignees } }).select("name email").lean()
    : [];
  const byId = Object.fromEntries(assigneeDocs.map((u) => [u._id.toString(), u]));

  const shaped = overdueTasks.map((t) => ({
    _id: t._id,
    title: t.title,
    description: t.description,
    status: t.status,
    deadline: t.deadline,
    createdAt: t.createdAt,
    project: t.project ? { _id: t.project, name: t.projectName } : null,
    assignedTo: t.assignedTo ? byId[t.assignedTo.toString()] || { _id: t.assignedTo } : null
  }));

  res.status(StatusCodes.OK).json({ overdueTasks: shaped });
});

export const getTaskSummary = catchAsync(async (req, res) => {
  const match = getTaskScopeFilter(req.user);
  const now = new Date();

  const [agg] = await Task.aggregate([
    { $match: match },
    ...taskWithCompletionStages(),
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
              pending: { $sum: { $cond: ["$isCompleted", 0, 1] } }
            }
          }
        ],
        overdue: [
          {
            $match: {
              isCompleted: false,
              deadline: { $lt: now }
            }
          },
          { $count: "count" }
        ],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }]
      }
    }
  ]);

  const t = agg.totals[0] || { total: 0, completed: 0, pending: 0 };
  const overdue = agg.overdue[0]?.count ?? 0;
  const statusBreakdown = agg.byStatus.map((row) => ({ status: row._id || "unknown", count: row.count }));

  const summary = {
    total: t.total ?? 0,
    completed: t.completed ?? 0,
    pending: t.pending ?? 0,
    overdue,
    statusBreakdown
  };

  res.status(StatusCodes.OK).json({ summary });
});
