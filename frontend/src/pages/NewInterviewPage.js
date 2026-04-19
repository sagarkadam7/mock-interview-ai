import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createInterview } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState("paste");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files[0] || e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") return setError("Only PDF files allowed.");
    if (f.size > 5 * 1024 * 1024) return setError("File too large. Max 5MB.");
    setFile(f);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!jobRole.trim()) return setError("Job role is required.");
    const hasResume = inputMode === "upload" ? !!file : resumeText.trim().length >= 50;
    if (!hasResume) {
      return setError(inputMode === "upload" ? "Please upload your resume PDF." : "Resume text must be at least 50 characters.");
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("jobRole", jobRole.trim());
      fd.append("jdText", jdText.trim());
      if (inputMode === "upload") fd.append("resume", file);
      else fd.append("resumeText", resumeText.trim());
      const { data } = await createInterview(fd);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen max-w-6xl">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-8">
        <div>
          <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:text-aura-ink">
            ← Back to dashboard
          </Link>
          <span className="section-eyebrow mb-3 block w-fit">New session</span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Configure your interview</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
            AI generates seven tailored questions from your resume and role. Add a job description for sharper targeting.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            key={error}
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="alert-error mb-8"
          >
            <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
              ⚠
            </span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="glass-panel-lg p-6 sm:p-8 md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white shadow-lg shadow-aura-violet/20">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-aura-ink">Role & job context</h2>
              <p className="text-sm text-slate-500">What position are you interviewing for?</p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <label className="label-field">Job role / position *</label>
              <input
                className="input-field"
                placeholder="e.g. Software Engineer, Data Analyst, Product Manager"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-field">
                Job description{" "}
                <span className="normal-case font-normal tracking-normal text-slate-500">(optional — improves relevance)</span>
              </label>
              <textarea
                className="input-field min-h-[120px] resize-y"
                placeholder="Paste the job description, key requirements, or team notes…"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel-lg p-6 sm:p-8 md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aura-violet to-aura-coral text-sm font-bold text-white shadow-lg shadow-aura-coral/20">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-aura-ink">Resume source</h2>
              <p className="text-sm text-slate-500">Paste text or upload a PDF — we never store your file after parsing.</p>
            </div>
          </div>

          <div className="mb-8 inline-flex rounded-full border border-slate-200/90 bg-slate-100/90 p-1 shadow-inner">
            {["paste", "upload"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setInputMode(mode);
                  setFile(null);
                  setResumeText("");
                  setError("");
                }}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  inputMode === mode
                    ? "bg-white text-aura-ink shadow-md shadow-slate-200/50 ring-1 ring-slate-200/80"
                    : "text-slate-500 hover:text-aura-ink"
                }`}
              >
                {mode === "paste" ? "Paste text" : "Upload PDF"}
              </button>
            ))}
          </div>

          {inputMode === "paste" ? (
            <div>
              <label className="label-field">Resume content *</label>
              <textarea
                className="input-field min-h-[220px] resize-y"
                placeholder="Paste your full resume — experience, skills, education, projects…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">Minimum 50 characters so the model has enough context.</p>
            </div>
          ) : (
            <div>
              <label className="label-field">Resume PDF *</label>
              <div
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                  dragOver
                    ? "border-aura-violet/50 bg-violet-50/80 shadow-lg shadow-violet-200/30"
                    : "border-slate-200 bg-slate-50/80 hover:border-aura-coral/35 hover:bg-orange-50/40"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
              >
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileDrop} />
                {file ? (
                  <div>
                    <div className="mb-3 text-4xl">✓</div>
                    <p className="font-semibold text-emerald-700">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB — click to replace</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 text-4xl opacity-50">↑</div>
                    <p className="mb-1 font-semibold text-aura-ink">Drop PDF here or click to browse</p>
                    <p className="text-xs text-slate-500">PDF only · Max 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn-cta w-full py-4 text-[15px]" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner h-5 w-5 !border-white/25 !border-t-white" /> Generating questions… (10–20s)
            </>
          ) : (
            "Generate interview questions →"
          )}
        </button>

        {loading && (
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-5 py-5 text-center text-sm text-slate-600 shadow-inner">
            Reading your resume and generating seven questions. This usually takes 10–20 seconds.
          </div>
        )}
      </form>
    </div>
  );
}
