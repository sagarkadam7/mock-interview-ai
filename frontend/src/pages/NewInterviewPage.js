import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createInterview } from "../utils/api";

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
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 md:px-8">
      <div className="mb-10">
        <span className="section-eyebrow mb-3">New interview</span>
        <h1 className="text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Configure your session</h1>
        <p className="mt-2 text-aura-muted">Gemini AI will generate 7 personalised questions from your resume and job details.</p>
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
            className="alert-error mb-6"
          >
            <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
              ⚠
            </span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="glass-panel-lg p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-bold text-white">
              1
            </div>
            <h2 className="text-lg font-bold tracking-tight text-aura-ink">Job details</h2>
          </div>
          <div className="flex flex-col gap-4">
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
                <span className="normal-case font-normal tracking-normal text-aura-muted">(optional — improves question quality)</span>
              </label>
              <textarea
                className="input-field min-h-[100px] resize-y"
                placeholder="Paste the job description here…"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel-lg p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-aura-violet to-aura-coral text-xs font-bold text-white">
              2
            </div>
            <h2 className="text-lg font-bold tracking-tight text-aura-ink">Your resume</h2>
          </div>

          <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-100/90 p-1 shadow-inner">
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
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                  inputMode === mode
                    ? "bg-aura-cta text-zinc-900 shadow-sm"
                    : "text-aura-muted hover:text-aura-ink"
                }`}
              >
                {mode === "paste" ? "📋 Paste text" : "📄 Upload PDF"}
              </button>
            ))}
          </div>

          {inputMode === "paste" ? (
            <div>
              <label className="label-field">Resume content *</label>
              <textarea
                className="input-field min-h-[200px] resize-y"
                placeholder="Paste your full resume here — work experience, skills, education, projects…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <p className="mt-2 text-xs text-aura-muted">Tip: Copy everything from your resume document and paste it here.</p>
            </div>
          ) : (
            <div>
              <label className="label-field">Resume PDF *</label>
              <div
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                  dragOver
                    ? "border-aura-violet/50 bg-aura-violet/5 shadow-lg shadow-aura-violet/10"
                    : "border-slate-200 bg-slate-50/80 hover:border-aura-coral/40 hover:bg-orange-50/50"
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
                    <p className="font-semibold text-emerald-400">{file.name}</p>
                    <p className="mt-1 text-xs text-aura-muted">{(file.size / 1024).toFixed(0)} KB — click to change</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 text-4xl opacity-40">↑</div>
                    <p className="mb-1 font-medium text-aura-ink">Drop your PDF here or click to browse</p>
                    <p className="text-xs text-aura-muted">PDF only · Max 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn-cta w-full" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner h-5 w-5 !border-white/25 !border-t-white" /> Gemini is generating your questions… (10–15s)
            </>
          ) : (
            "Generate interview questions →"
          )}
        </button>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-center text-sm text-aura-muted">
            Reading your resume and generating 7 questions. This usually takes 10–20 seconds.
          </div>
        )}
      </form>
    </div>
  );
}
