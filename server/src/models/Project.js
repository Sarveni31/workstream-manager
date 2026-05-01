import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, default: "" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["Active", "Archived"], default: "Active" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    deadline: { type: Date, default: null },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    visibility: {
      type: String,
      enum: ["team", "private"],
      default: "team"
    },
    workflowStatuses: {
      type: [String],
      default: ["Todo", "In Progress", "Done"]
    },
    completedStatuses: {
      type: [String],
      default: ["Done"]
    }
  },
  { timestamps: true }
);

projectSchema.index({ admin: 1, name: 1 }, { unique: true });
projectSchema.index({ members: 1, status: 1 });

projectSchema.pre("save", function validateWorkflow(next) {
  const workflow =
    Array.isArray(this.workflowStatuses) && this.workflowStatuses.length > 0
      ? [...new Set(this.workflowStatuses.map((s) => String(s).trim()).filter(Boolean))]
      : ["Todo", "In Progress", "Done"];
  this.workflowStatuses = workflow.slice(0, 50);

  const completedDefaults = workflow.includes("Done")
    ? ["Done"]
    : [workflow.at(-1)].filter(Boolean);
  let completed =
    Array.isArray(this.completedStatuses) && this.completedStatuses.length > 0
      ? [...new Set(this.completedStatuses.map((s) => String(s).trim()).filter(Boolean))]
      : completedDefaults;
  completed = completed.filter((s) => workflow.includes(s));
  if (!completed.length) {
    completed = completedDefaults.filter((s) => workflow.includes(s));
  }
  this.completedStatuses = completed;

  next();
});

export const Project = mongoose.model("Project", projectSchema);
