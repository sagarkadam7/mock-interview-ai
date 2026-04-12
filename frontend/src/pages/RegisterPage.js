import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../utils/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-black px-6 py-12">
      <div className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-aura-violet/18 via-aura-coral/10 to-transparent blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-page-in">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2 no-underline">
            <span className="text-[11px] font-semibold uppercase tracking-aura text-aura-muted">InterviewAI</span>
            <span className="text-lg font-semibold tracking-tight text-white">Create your workspace</span>
          </Link>
          <p className="mt-3 text-sm text-aura-muted">Free account · no card required</p>
        </div>

        <div className="glass-panel-lg p-8 md:p-10">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="label-field">
                Full name
              </label>
              <input
                id="name"
                className="input-field"
                name="name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handle}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="label-field">
                Email address
              </label>
              <input
                id="email"
                className="input-field"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="label-field">
                Password
              </label>
              <input
                id="password"
                className="input-field"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handle}
                required
              />
            </div>

            <button type="submit" className="btn-cta mt-2 w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner h-5 w-5 !border-t-zinc-900 !border-zinc-300/30" /> Creating account…
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <div className="my-8 h-px bg-white/[0.08]" />
          <p className="text-center text-sm text-aura-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-white transition-colors hover:text-aura-coral">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
