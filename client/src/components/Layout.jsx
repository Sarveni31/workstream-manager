import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Team Task Manager</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/tasks">Tasks</Link>
            <span className="text-slate-500">{user?.name}</span>
            <button onClick={logout} className="rounded bg-slate-800 px-3 py-1 text-white">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
