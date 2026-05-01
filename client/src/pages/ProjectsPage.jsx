import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberInputs, setMemberInputs] = useState({});

  const loadProjects = async () => {
    try {
      setError("");
      const { data } = await api.get("/projects");
      setProjects(data.projects);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      loadProjects();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create project");
    }
  };

  const setInput = (projectId, field, value) => {
    setMemberInputs((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), [field]: value }
    }));
  };

  const addMember = async (projectId) => {
    const userId = memberInputs[projectId]?.add?.trim();
    if (!userId) return;
    try {
      await api.patch(`/projects/${projectId}/members/add`, { userId });
      setInput(projectId, "add", "");
      loadProjects();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (projectId) => {
    const userId = memberInputs[projectId]?.remove?.trim();
    if (!userId) return;
    try {
      await api.patch(`/projects/${projectId}/members/remove`, { userId });
      setInput(projectId, "remove", "");
      loadProjects();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Projects</h2>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {user?.role === "admin" && (
        <form onSubmit={createProject} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">New project</h3>
          <input
            className="w-full rounded border p-2"
            placeholder="Project name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <textarea
            className="w-full rounded border p-2"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
            Create project
          </button>
        </form>
      )}

      <div className="space-y-4">
        {projects.length === 0 && !error && (
          <div className="rounded-xl border bg-white p-6 text-sm text-slate-700 shadow-sm">
            {user?.role === "admin" ? (
              <>
                <p className="font-medium text-slate-900">No projects yet.</p>
                <p className="mt-1 text-slate-600">
                  Create your first project using the form above, then add members using their MongoDB user ID.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-slate-900">No projects assigned to you yet.</p>
                <p className="mt-1 text-slate-600">
                  Ask an admin to add you to a project. Once added, it will appear here automatically.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Tip: An admin can add you using your user ID from the database. After they add you, log out and
                  log in again if you don’t see it immediately.
                </p>
              </>
            )}
          </div>
        )}
        {projects.map((project) => (
          <article key={project._id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <p className="text-xs text-slate-400">ID: {project._id}</p>
                <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Status: {project.status || "Active"} · Priority: {project.priority || "medium"} · Visibility:{" "}
                  {project.visibility || "team"}
                </p>
              </div>
            </div>

            <div className="mt-3 border-t pt-3">
              <p className="mb-2 text-sm font-medium text-slate-800">Members</p>
              <ul className="mb-3 space-y-1 text-sm text-slate-700">
                {(project.members || []).length === 0 ? (
                  <li className="text-slate-500">No members listed.</li>
                ) : (
                  (project.members || []).map((m) => (
                    <li key={m._id || m}>
                      {m.name || "User"} ({m.email || m._id})
                    </li>
                  ))
                )}
              </ul>

              {user?.role === "admin" && (
                <div className="flex flex-wrap gap-2">
                  <input
                    className="flex-1 min-w-[140px] rounded border p-2 text-sm"
                    placeholder="User ID to add"
                    value={memberInputs[project._id]?.add || ""}
                    onChange={(e) => setInput(project._id, "add", e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded bg-slate-800 px-3 py-2 text-sm text-white"
                    onClick={() => addMember(project._id)}
                  >
                    Add
                  </button>
                  <input
                    className="flex-1 min-w-[140px] rounded border p-2 text-sm"
                    placeholder="User ID to remove"
                    value={memberInputs[project._id]?.remove || ""}
                    onChange={(e) => setInput(project._id, "remove", e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    onClick={() => removeMember(project._id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
