import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createInterview } from "../utils/api";

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const [jobRole,    setJobRole]    = useState("");
  const [jdText,     setJdText]     = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file,       setFile]       = useState(null);
  const [inputMode,  setInputMode]  = useState("paste");
  const [dragOver,   setDragOver]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef();

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer?.files[0] || e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") return setError("Only PDF files allowed.");
    if (f.size > 5 * 1024 * 1024) return setError("File too large. Max 5MB.");
    setFile(f); setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!jobRole.trim()) return setError("Job role is required.");
    const hasResume = inputMode === "upload" ? !!file : resumeText.trim().length >= 50;
    if (!hasResume) return setError(inputMode === "upload" ? "Please upload your resume PDF." : "Resume text must be at least 50 characters.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("jobRole", jobRole.trim());
      fd.append("jdText",  jdText.trim());
      if (inputMode === "upload") fd.append("resume", file);
      else fd.append("resumeText", resumeText.trim());
      const { data } = await createInterview(fd);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="page animate-fade-up">
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="tag" style={{ marginBottom: 14 }}>NEW INTERVIEW</div>
          <h2 style={{ marginBottom: 10 }}>Configure your session</h2>
          <p style={{ color: "var(--text2)", fontSize: 15 }}>
            Gemini AI will generate 7 personalised questions from your resume and job details.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Step 1 */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>1</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif" }}>Job details</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label>Job role / position *</label>
                <input className="input" placeholder="e.g. Software Engineer, Data Analyst, Product Manager" value={jobRole} onChange={e => setJobRole(e.target.value)} required />
              </div>
              <div>
                <label>Job description <span style={{ color: "var(--text3)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>(optional — improves question quality)</span></label>
                <textarea className="textarea" placeholder="Paste the job description here…" value={jdText} onChange={e => setJdText(e.target.value)} style={{ minHeight: 100 }} />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>2</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif" }}>Your resume</h3>
            </div>

            {/* Toggle */}
            <div style={{ display: "inline-flex", background: "var(--bg3)", borderRadius: "var(--r)", padding: 4, marginBottom: 20, border: "1px solid var(--border)" }}>
              {["paste", "upload"].map((mode) => (
                <button key={mode} type="button"
                  onClick={() => { setInputMode(mode); setFile(null); setResumeText(""); setError(""); }}
                  style={{
                    padding: "8px 20px", borderRadius: "var(--r-sm)", border: "none",
                    cursor: "pointer", fontSize: 13, fontWeight: 500,
                    fontFamily: "'Outfit',sans-serif",
                    background: inputMode === mode ? "var(--indigo)" : "transparent",
                    color: inputMode === mode ? "#fff" : "var(--text3)",
                    transition: "all 0.2s",
                    boxShadow: inputMode === mode ? "0 2px 12px rgba(99,102,241,0.3)" : "none",
                  }}
                >
                  {mode === "paste" ? "📋 Paste text" : "📄 Upload PDF"}
                </button>
              ))}
            </div>

            {inputMode === "paste" ? (
              <div>
                <label>Resume content *</label>
                <textarea className="textarea" placeholder="Paste your full resume here — work experience, skills, education, projects…" value={resumeText} onChange={e => setResumeText(e.target.value)} style={{ minHeight: 200 }} />
                <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>Tip: Copy everything from your resume document and paste it here.</p>
              </div>
            ) : (
              <div>
                <label>Resume PDF *</label>
                <div className={`upload-area ${dragOver ? "drag-over" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFileDrop} />
                  {file ? (
                    <div>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                      <p style={{ fontWeight: 600, color: "var(--green)", marginBottom: 4 }}>{file.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text3)" }}>{(file.size/1024).toFixed(0)} KB — click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>↑</div>
                      <p style={{ fontWeight: 500, marginBottom: 6 }}>Drop your PDF here or click to browse</p>
                      <p style={{ fontSize: 12, color: "var(--text3)" }}>PDF only · Max 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button className="btn btn-grad btn-full btn-lg" type="submit" disabled={loading} style={{ fontSize: 15 }}>
            {loading ? (
              <><span className="spinner" /> Gemini is generating your questions… (10–15s)</>
            ) : "Generate interview questions →"}
          </button>

          {loading && (
            <div style={{ textAlign: "center", padding: "16px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "var(--r)", fontSize: 13, color: "var(--indigo2)" }}>
              🤖 Reading your resume and crafting 7 personalised questions. This takes about 15 seconds.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}