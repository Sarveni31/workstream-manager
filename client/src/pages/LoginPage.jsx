import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md app-card p-6">
      <h2 className="page-title mb-1">Welcome back</h2>
      <p className="page-subtitle mb-5">Login to continue managing projects and tasks.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          className="app-input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          className="app-input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        No account? <Link className="underline" to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
