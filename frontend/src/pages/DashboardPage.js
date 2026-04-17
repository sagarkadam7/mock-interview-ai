import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getAllInterviews, deleteInterview } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { Sparkline } from "../components/Charts";

function StatusBadge({ status }) {
  const map = {
    pending: ["Not started", "border-amber-200 bg-amber-50 text-amber-800"],
    in_progress: ["In progress", "border-violet-200 bg-violet-50 text-violet-800"],
    completed: ["Completed", "border-emerald-200 bg-emerald-50 text-emerald-800"],
  };
  const [label, cls] = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function ScoreDisplay({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-sm font-medium text-slate-400">—</span>;
  }
  const color = score >= 7 ? "text-emerald-600" : score >= 4 ? "text-amber-600" : "text-rose-600";
  return (
    <div className="text-center">
      <div className={`font-sans text-2xl font-extrabold leading-none tracking-tight ${color}`}>{score}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">/10</div>
    </div>
  );
}

const statMeta = [
  { label: "Total interviews", key: "total", accent: "text-violet-600", icon: "◇" },
  { label: "Completed", key: "done", accent: "text-emerald-600", icon: "✓" },
  { label: "Avg score", key: "avg", accent: "text-amber-600", icon: "◎" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getAllInterviews()
      .then(({ data }) => setInterviews(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm("This interview and all answers will be removed. This cannot be undone.", {
      title: "Delete interview?",
      variant: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Keep",
    });
    if (!ok) return;
    setDeleting(id);
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
      toast.success("Interview deleted");
    } catch {
      toast.error("Couldn’t delete the interview. Try again.");
    } finally {
      setDeleting(null);
    }
  };

  const completed = interviews.filter((i) => i.status === "completed");
  const completedSorted = [...completed].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const trend = completedSorted.map((i) => i.overallScore).filter((v) => typeof v === "number");
  const trendLast = trend.slice(-8);
  const avgScore =
    completed.filter((i) => i.overallScore !== null).length > 0
      ? (
          completed.filter((i) => i.overallScore !== null).reduce((s, i) => s + i.overallScore, 0) /
          completed.filter((i) => i.overallScore !== null).length
        ).toFixed(1)
      : null;

  const stats = [
    { label: statMeta[0].label, value: interviews.length, accent: statMeta[0].accent, icon: statMeta[0].icon },
    { label: statMeta[1].label, value: completed.length, accent: statMeta[1].accent, icon: statMeta[1].icon },
    { label: statMeta[2].label, value: avgScore ?? "—", accent: statMeta[2].accent, icon: statMeta[2].icon },
  ];

  return (
    <div className="page-shell min-h-screen max-w-6xl">
      <div className="mb-12 flex flex-col gap-8 border-b border-slate-200/80 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Workspace</p>
          <h1 className="bg-gradient-to-br from-aura-ink via-slate-800 to-slate-600 bg-clip-text font-display text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            {user?.name?.split(" ")[0] || "Candidate"}
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">Track sessions, scores, and momentum across every mock round.</p>
        </div>
        <Link to="/interview/new" className="no-underline">
          <button type="button" className="btn-cta whitespace-nowrap text-sm shadow-[0_8px_28px_-6px_rgba(157,80,187,0.35)]">
            + New interview
          </button>
        </Link>
      </div>

      {interviews.length > 0 && (
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-panel interactive-lift relative flex flex-col overflow-hidden rounded-2xl p-8 text-center"
            >
              <span className="absolute right-5 top-5 text-2xl opacity-[0.12]" aria-hidden>
                {s.icon}
              </span>
              <div className={`font-sans text-3xl font-extrabold tabular-nums tracking-tight ${s.accent}`}>{s.value}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {trendLast.length >= 2 && (
        <div className="glass-panel-lg mb-12 min-w-0 overflow-hidden p-6 md:p-8">
          <div className="mb-6 flex min-w-0 flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <span className="section-eyebrow mb-3">Momentum</span>
              <h2 className="text-xl font-bold tracking-tight text-aura-ink">Score trend</h2>
              <p className="mt-1 text-sm text-slate-600">Last {trendLast.length} completed sessions</p>
            </div>
            <div className="min-w-0 flex-1">
              <Sparkline data={trendLast} stroke="#9D50BB" fill="rgba(157,80,187,0.14)" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <span className="spinner h-10 w-10 border-t-aura-violet" />
          <p className="mt-5 text-sm font-medium text-slate-500">Loading your interviews…</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="glass-panel-lg relative overflow-hidden py-20 text-center md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/80 via-transparent to-orange-50/50" />
          <div className="relative z-10 px-4">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-aura-coral/15 to-aura-violet/15 text-3xl shadow-inner ring-1 ring-white/80">
              ◎
            </div>
            <h2 className="mb-3 font-display text-2xl font-semibold tracking-tight text-aura-ink">No interviews yet</h2>
            <p className="mx-auto mb-10 max-w-md text-[15px] leading-relaxed text-slate-600">
              Start your first mock session — we’ll tailor questions to your resume and measure what recruiters actually care about.
            </p>
            <Link to="/interview/new" className="no-underline">
              <button type="button" className="btn-cta px-10">
                Start your first interview
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.07, delayChildren: 0.04 },
            },
          }}
        >
          {interviews.map((iv) => {
            const answered = iv.questions?.filter((q) => q.score !== null).length || 0;
            const total = iv.questions?.length || 0;
            const pct = total > 0 ? (answered / total) * 100 : 0;

            return (
              <motion.div
                key={iv._id}
                role="button"
                tabIndex={0}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
                }}
                onClick={() => navigate(iv.status === "completed" ? `/interview/${iv._id}/report` : `/interview/${iv._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(iv.status === "completed" ? `/interview/${iv._id}/report` : `/interview/${iv._id}`);
                  }
                }}
                className="glass-panel interactive-lift group flex cursor-pointer flex-wrap items-center gap-5 rounded-2xl p-6 md:flex-nowrap md:gap-6 md:p-8"
              >
                <div className="w-14 shrink-0 text-center md:w-16">
                  <ScoreDisplay score={iv.overallScore} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold tracking-tight text-aura-ink">{iv.jobRole}</span>
                    <StatusBadge status={iv.status} />
                  </div>
                  <p className="mb-3 text-xs font-medium text-slate-500">
                    {new Date(iv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {answered}/{total} questions
                  </p>
                  <div className="progress-track">
                    <div className="progress-fill-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {iv.avgEyeContact !== null && (
                  <div className="flex min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 text-center">
                    <span
                      className={`text-lg font-bold tabular-nums leading-none ${
                        iv.avgEyeContact > 70 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {iv.avgEyeContact}
                      <span className="text-sm font-semibold">%</span>
                    </span>
                    <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Eye
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-danger shrink-0"
                  onClick={(e) => handleDelete(iv._id, e)}
                  disabled={deleting === iv._id}
                >
                  {deleting === iv._id ? <span className="spinner h-4 w-4" /> : "Delete"}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
