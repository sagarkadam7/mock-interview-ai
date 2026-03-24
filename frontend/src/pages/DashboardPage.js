import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllInterviews, deleteInterview } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function StatusBadge({ status }) {
  const map = { pending: ["Not started","badge-pending"], in_progress: ["In progress","badge-progress"], completed: ["Completed","badge-completed"] };
  const [label, cls] = map[status] || map.pending;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function ScoreDisplay({ score }) {
  if (score === null || score === undefined) return <span style={{ fontSize: 12, color: "var(--text3)" }}>—</span>;
  const color = score >= 7 ? "var(--green)" : score >= 4 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>/10</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(null);

  useEffect(() => {
    getAllInterviews()
      .then(({ data }) => setInterviews(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm("Delete this interview permanently?")) return;
    setDeleting(id);
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
    } catch { alert("Failed to delete."); }
    finally { setDeleting(null); }
  };

  const completed = interviews.filter((i) => i.status === "completed");
  const avgScore  = completed.filter((i) => i.overallScore !== null).length
    ? (completed.filter((i) => i.overallScore !== null).reduce((s,i) => s + i.overallScore, 0) / completed.filter((i) => i.overallScore !== null).length).toFixed(1)
    : null;

  return (
    <div className="page container animate-fade-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Welcome back</p>
          <h2 style={{ marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: "var(--text3)", fontSize: 14 }}>Track your interview practice progress</p>
        </div>
        <Link to="/interview/new">
          <button className="btn btn-grad">+ New interview</button>
        </Link>
      </div>

      {/* Stats */}
      {interviews.length > 0 && (
        <div className="grid-3" style={{ marginBottom: 40 }}>
          {[
            { label: "Total interviews", value: interviews.length, color: "var(--indigo2)" },
            { label: "Completed", value: completed.length, color: "var(--green)" },
            { label: "Avg score", value: avgScore ?? "—", color: "var(--amber)" },
          ].map((s) => (
            <div key={s.label} className="stat-chip">
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Interview list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36 }} />
          <p style={{ marginTop: 16, color: "var(--text3)", fontSize: 14 }}>Loading interviews…</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "80px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.3 }}>◎</div>
          <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>No interviews yet</h3>
          <p style={{ color: "var(--text3)", marginBottom: 28, fontSize: 14 }}>Start your first mock interview to see results here.</p>
          <Link to="/interview/new">
            <button className="btn btn-grad">Start your first interview</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {interviews.map((iv, i) => {
            const answered = iv.questions?.filter((q) => q.score !== null).length || 0;
            const total    = iv.questions?.length || 0;
            const pct      = total > 0 ? (answered / total) * 100 : 0;

            return (
              <div
                key={iv._id}
                onClick={() => navigate(iv.status === "completed" ? `/interview/${iv._id}/report` : `/interview/${iv._id}`)}
                className="card animate-fade-up"
                style={{
                  display: "flex", alignItems: "center", gap: 20,
                  flexWrap: "wrap", cursor: "pointer",
                  animationDelay: `${i * 0.05}s`,
                  transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                {/* Score */}
                <div style={{ width: 56, flexShrink: 0, textAlign: "center" }}>
                  <ScoreDisplay score={iv.overallScore} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "1rem" }}>{iv.jobRole}</span>
                    <StatusBadge status={iv.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>
                    {new Date(iv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{answered}/{total} questions
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* ML badges */}
                {iv.avgEyeContact !== null && (
                  <div style={{ fontSize: 12, color: "var(--text3)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ color: iv.avgEyeContact > 70 ? "var(--green)" : "var(--amber)", fontWeight: 600 }}>{iv.avgEyeContact}%</span>
                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>eye</span>
                  </div>
                )}

                {/* Delete */}
                <button
                  className="btn btn-danger"
                  style={{ padding: "7px 14px", fontSize: 12, flexShrink: 0 }}
                  onClick={(e) => handleDelete(iv._id, e)}
                  disabled={deleting === iv._id}
                >
                  {deleting === iv._id ? <span className="spinner" /> : "Delete"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}