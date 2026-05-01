import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Team Task Manager</h1>
          <nav className="flex items-center gap-2 text-sm">
            <Link className="btn-secondary !px-3 !py-1.5" to="/dashboard">Dashboard</Link>
            <Link className="btn-secondary !px-3 !py-1.5" to="/projects">Projects</Link>
            <Link className="btn-secondary !px-3 !py-1.5" to="/tasks">Tasks</Link>
            <span className="ml-2 hidden text-slate-500 sm:block">{user?.name}</span>
            <button onClick={logout} className="btn-primary !px-3 !py-1.5">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
