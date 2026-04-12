import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-aura-page px-6 py-12">
      <div className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-aura-violet/18 via-aura-coral/12 to-transparent blur-3xl" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2 no-underline transition-opacity hover:opacity-90">
            <span className="text-[11px] font-semibold uppercase tracking-aura text-aura-muted">InterviewAI</span>
            <span className="text-lg font-semibold tracking-tight text-aura-ink">Create your workspace</span>
          </Link>
          <p className="mt-3 text-sm text-aura-muted">Free account · no card required</p>
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
                  <span className="spinner h-5 w-5 !border-white/25 !border-t-white" /> Creating account…
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <div className="my-8 h-px bg-slate-200" />
          <p className="text-center text-sm text-aura-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-aura-ink transition-colors hover:text-aura-violet">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
