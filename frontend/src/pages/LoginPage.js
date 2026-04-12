import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../utils/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-aura-page px-6 py-12">
      <div className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-aura-coral/20 via-aura-violet/12 to-transparent blur-3xl" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2 no-underline transition-opacity hover:opacity-90">
            <span className="text-[11px] font-semibold uppercase tracking-aura text-aura-muted">InterviewAI</span>
            <span className="text-lg font-semibold tracking-tight text-aura-ink">Welcome back</span>
          </Link>
          <p className="mt-3 text-sm text-aura-muted">Sign in to continue to your dashboard</p>
        </div>

        <div className="glass-panel-lg p-8 md:p-10">
          <AnimatePresence>
            {error && (
              <motion.div
                key={error}
                role="alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="alert-error mb-6"
              >
                <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
                  ⚠
                </span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit} className="flex flex-col gap-5">
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
                placeholder="Your password"
                value={form.password}
                onChange={handle}
                required
              />
            </div>

            <button type="submit" className="btn-cta mt-2 w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner h-5 w-5 !border-white/25 !border-t-white" /> Signing in…
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          <div className="my-8 h-px bg-slate-200" />
          <p className="text-center text-sm text-aura-muted">
            No account?{" "}
            <Link to="/register" className="font-medium text-aura-ink transition-colors hover:text-aura-violet">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
