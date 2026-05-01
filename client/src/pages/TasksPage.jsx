import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const DEFAULT_WORKFLOW = ["Todo", "In Progress", "Done"];

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    deadline: "",
    priority: "medium",
    status: ""
  });

  const loadTasks = async () => {
    try {
      setError("");
      const { data } = await api.get("/tasks");
      setTasks(data.tasks || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load tasks");
    }
  };

  const loadProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects || []);
    } catch {
      /* ignore — task list still useful */
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === form.projectId),
    [projects, form.projectId]
  );

  const workflowForForm = useMemo(() => {
    const ws = selectedProject?.workflowStatuses;
    return Array.isArray(ws) && ws.length ? ws : DEFAULT_WORKFLOW;
  }, [selectedProject]);

  useEffect(() => {
    if (!form.projectId) return;
    const first = workflowForForm[0];
    setForm((prev) => ({ ...prev, status: prev.status || first }));
  }, [form.projectId, workflowForForm]);

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update task status");
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    if (!form.projectId || !form.assignedTo || !form.deadline || !form.title.trim()) {
      setError("Fill project, assignee, title, and deadline.");
      return;
    }
    try {
      setError("");
      const payload = {
        title: form.title.trim(),
        description: form.description,
        projectId: form.projectId,
        assignedTo: form.assignedTo,
        deadline: new Date(form.deadline).toISOString(),
        priority: form.priority,
        ...(form.status ? { status: form.status } : {})
      };
      await api.post("/tasks", payload);
      setForm({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        deadline: "",
        priority: "medium",
        status: ""
      });
      loadTasks();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create task");
    }
  };

  const statusOptionsForTask = (task) => {
    const ws = task.project?.workflowStatuses;
    return Array.isArray(ws) && ws.length ? ws : DEFAULT_WORKFLOW;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Tasks</h2>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Create task</h3>
        <p className="mb-3 text-xs text-slate-500">
          Admins and project members can create tasks. Assignee must belong to the project.
        </p>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={createTask}>
          <input
            className="rounded border p-2 sm:col-span-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="rounded border p-2 sm:col-span-2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="rounded border p-2"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value, assignedTo: "" })}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="rounded border p-2"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            disabled={!selectedProject}
          >
            <option value="">Assign to…</option>
            {(selectedProject?.members || []).map((m) => (
              <option key={m._id || m} value={m._id || m}>
                {m.name ? `${m.name} (${m.email})` : String(m._id || m)}
              </option>
            ))}
          </select>
          <input
            className="rounded border p-2"
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <select
            className="rounded border p-2"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Priority: low</option>
            <option value="medium">Priority: medium</option>
            <option value="high">Priority: high</option>
          </select>
          {form.projectId && (
            <select
              className="rounded border p-2 sm:col-span-2"
              value={form.status || workflowForForm[0]}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {workflowForForm.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          )}
          <button
            className="rounded bg-slate-900 px-4 py-2 text-white sm:col-span-2"
            type="submit"
          >
            Create task
          </button>
        </form>
      </section>

      <div className="space-y-3">
        {tasks.map((task) => {
          const options = statusOptionsForTask(task);
          const me = user?.id || user?._id;
          const assigneeId = task.assignedTo?._id || task.assignedTo;
          const canChangeStatus =
            user?.role === "admin" || (me && assigneeId && String(assigneeId) === String(me));

          return (
            <article key={task._id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-slate-600">
                    {task.project?.name} · Priority: {task.priority || "medium"}
                  </p>
                </div>
                {canChangeStatus ? (
                  <select
                    className="rounded border p-2"
                    value={task.status}
                    onChange={(event) => updateStatus(task._id, event.target.value)}
                  >
                    {options.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs">{task.status}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!tasks.length && <p className="text-sm text-slate-500">No tasks yet. Create one above.</p>}
    </div>
  );
};

export default TasksPage;
