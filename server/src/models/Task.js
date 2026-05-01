import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "Todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, required: true }
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, assignedTo: 1, status: 1 });
taskSchema.index({ assignedTo: 1, deadline: 1, status: 1 });
taskSchema.index({ createdBy: 1, deadline: 1, status: 1 });

export const Task = mongoose.model("Task", taskSchema);
