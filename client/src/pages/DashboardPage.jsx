import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const DEFAULT_STATUSES = ["Todo", "In Progress", "Done"];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryRes, tasksRes, overdueRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/all-tasks"),
          api.get("/dashboard/overdue-tasks")
        ]);

        setSummary(summaryRes.data.summary);
        setTasks(tasksRes.data.tasks);
        setOverdueTasks(overdueRes.data.overdueTasks);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statusFilters = useMemo(() => {
    const fromTasks = tasks.flatMap((t) => {
      const ws = t.project?.workflowStatuses;
      return Array.isArray(ws) && ws.length ? ws : [t.status].filter(Boolean);
    });
    const fromSummary = summary?.statusBreakdown?.map((row) => row.status) || [];
    const uniq = [...new Set([...fromTasks, ...fromSummary, ...DEFAULT_STATUSES])];
    return ["All", ...uniq];
  }, [tasks, summary]);

  const filteredTasks =
    selectedStatus === "All" ? tasks : tasks.filter((task) => task.status === selectedStatus);

  if (loading) return <div className="app-card p-6">Loading dashboard...</div>;
  if (error) return <div className="app-card bg-red-50 p-6 text-red-700">{error}</div>;

  const cards = [
    { label: "Total", value: summary?.total ?? 0 },
    { label: "Pending", value: summary?.pending ?? 0 },
    { label: "Completed", value: summary?.completed ?? 0 },
    { label: "Overdue", value: summary?.overdue ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Track tasks, progress, and overdue items in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <div key={item.label} className="app-card p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="app-card p-4 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Task List</h3>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedStatus === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks found for this filter.</p>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((task) => (
                <li key={task._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {task.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{task.description || "No description"}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Project: {task.project?.name || "N/A"}</span>
                    <span>Assigned: {task.assignedTo?.name || "N/A"}</span>
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="app-card p-4">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Overdue Tasks</h3>
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No overdue tasks.</p>
          ) : (
            <ul className="space-y-3">
              {overdueTasks.map((task) => (
                <li key={task._id} className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-600">{task.project?.name || "No project"}</p>
                  <p className="mt-1 text-xs font-medium text-red-700">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
