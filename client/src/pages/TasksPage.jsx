import { useEffect, useState } from "react";
import api from "../lib/api";

const TASK_STATUSES = ["Todo", "In Progress", "Done"];

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setError("");
      const { data } = await api.get("/tasks");
      setTasks(data.tasks);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load tasks");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update task status");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Tasks</h2>
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task._id} className="rounded bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-slate-600">{task.project?.name}</p>
              </div>
              <select
                className="rounded border p-2"
                value={task.status}
                onChange={(event) => updateStatus(task._id, event.target.value)}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
