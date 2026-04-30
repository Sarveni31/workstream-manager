import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });

  const loadProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data.projects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    await api.post("/projects", form);
    setForm({ name: "", description: "" });
    loadProjects();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Projects</h2>
      {user?.role === "admin" && (
        <form onSubmit={createProject} className="space-y-3 rounded bg-white p-4 shadow">
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
            Create Project
          </button>
        </form>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <article key={project._id} className="rounded bg-white p-4 shadow">
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-sm text-slate-600">{project.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
