import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [error, setError] = useState("");
  const [useAdminCode, setUseAdminCode] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const payload = useAdminCode
      ? { ...form }
      : { name: form.name, email: form.email, password: form.password };

    try {
      await signup(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md app-card p-6">
      <h2 className="page-title mb-1">Create account</h2>
      <p className="page-subtitle mb-5">Get started with your team workspace.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          className="app-input"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
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
          minLength={8}
          maxLength={64}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <p className="text-xs text-slate-500">
          Use 8-64 characters with uppercase, lowercase, number, and special character.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={useAdminCode}
            onChange={(event) => setUseAdminCode(event.target.checked)}
          />
          Signup as admin (requires admin invite code)
        </label>
        {useAdminCode && (
          <input
            className="app-input"
            placeholder="Admin invite code"
            value={form.adminCode}
            onChange={(event) => setForm({ ...form, adminCode: event.target.value })}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link className="underline" to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupPage;
