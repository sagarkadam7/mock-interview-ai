import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../utils/api";
import AuthBrandPanel from "../components/AuthBrandPanel";

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
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      navigate("/welcome");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-aura-page lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="relative flex items-center justify-center px-6 py-14 sm:px-10 lg:py-20">
        <div className="pointer-events-none absolute left-0 bottom-0 h-[min(55%,380px)] w-[380px] -translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tr from-aura-coral/10 to-transparent blur-3xl" />

        <motion.div
          className="auth-form-shell relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-10 lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-aura-muted no-underline"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-black text-white shadow-md">
                IA
              </span>
              InterviewAI
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink sm:text-[2rem]">Create your workspace</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-aura-muted">Free account · no card required · start practicing in minutes.</p>
          </div>

          <div className="glass-panel-lg p-8 sm:p-10">
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
                <label htmlFor="name" className="label-field">
                  Full name
                </label>
                <input
                  id="name"
                  className="input-field"
                  name="name"
                  placeholder="Jane Smith"
                  autoComplete="name"
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
                  autoComplete="email"
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
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handle}
                  minLength={8}
                  required
                />
              </div>

              <button type="submit" className="btn-cta mt-2 w-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner h-5 w-5 !border-white/25 !border-t-white dark:!border-slate-900/20 dark:!border-t-slate-900" /> Creating account…
                  </>
                ) : (
                  "Create account →"
                )}
              </button>
            </form>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <p className="text-center text-sm text-aura-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-aura-ink underline decoration-slate-300 underline-offset-4 transition-colors hover:text-aura-violet hover:decoration-aura-violet/40">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
