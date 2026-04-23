import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getAllInterviews, deleteInterview } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { Sparkline } from "../components/Charts";
import { computePracticeStreak, countCompletedThisWeek, WEEKLY_SESSION_GOAL } from "../utils/practiceSignals";

function StatusBadge({ status }) {
  const map = {
    pending: ["Not started", "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-200"],
    in_progress: ["In progress", "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/35 dark:bg-violet-950/50 dark:text-violet-200"],
    completed: ["Completed", "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-950/45 dark:text-emerald-200"],
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
    return <span className="text-sm font-medium text-slate-400 dark:text-slate-500">—</span>;
  }
  const color =
    score >= 7 ? "text-emerald-600 dark:text-emerald-400" : score >= 4 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  return (
    <div className="text-center">
      <div className={`font-sans text-2xl font-extrabold leading-none tracking-tight ${color}`}>{score}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">/10</div>
    </div>
  );
}

function TrendPlaceholder() {
  return (
    <div className="relative flex min-h-[88px] w-full items-end justify-center rounded-xl border border-dashed border-slate-200/90 bg-slate-50/40 px-4 py-5 dark:border-slate-600/60 dark:bg-slate-900/40">
      <svg className="absolute inset-x-4 bottom-8 h-12 w-[calc(100%-2rem)] text-slate-300/80 dark:text-slate-600" viewBox="0 0 280 48" fill="none" aria-hidden>
        <path d="M4 38 Q70 8 140 28 T276 34" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="relative z-[1] text-center text-[13px] font-medium leading-snug text-slate-500 dark:text-slate-400">
        Complete <span className="text-aura-ink dark:text-slate-200">two scored sessions</span> to unlock your trend line
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:col-span-2" aria-busy="true" aria-label="Loading interviews">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-row flex flex-wrap items-center gap-5 rounded-2xl md:flex-nowrap md:gap-6">
          <div className="h-14 w-14 shrink-0 rounded-xl skeleton-line md:w-16" />
          <div className="min-w-0 flex-1 space-y-3 py-1">
            <div className="h-4 w-[75%] max-w-[220px] skeleton-line" />
            <div className="h-3 w-[45%] max-w-[140px] skeleton-line" />
            <div className="h-2 w-full max-w-lg skeleton-line opacity-80" />
          </div>
          <div className="h-10 w-24 shrink-0 rounded-full skeleton-line" />
        </div>
      ))}
      <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">Syncing your workspace…</p>
    </div>
  );
}

const statMeta = [
  { label: "Sessions", key: "total", hint: "All time", accent: "text-violet-600 dark:text-violet-400", icon: "◇" },
  { label: "Completed", key: "done", hint: "Scored & closed", accent: "text-emerald-600 dark:text-emerald-400", icon: "✓" },
  { label: "In flight", key: "active", hint: "Draft or live", accent: "text-amber-600 dark:text-amber-400", icon: "◆" },
  { label: "Avg score", key: "avg", hint: "Completed only", accent: "text-rose-600 dark:text-rose-400", icon: "◎" },
];

const RUNWAY_STEPS = [
  { n: "01", title: "Resume + role", body: "Upload a PDF and paste the JD so every question maps to your story." },
  { n: "02", title: "Live mock", body: "Speech, pace, and gaze are measured while you answer — like the real loop." },
  { n: "03", title: "Scorecard + PDF", body: "Export structured feedback you can rehearse against before the next round." },
];

const SIDEBAR_LINKS = [
  { to: "/pricing", label: "Plans & limits", sub: "Compare tiers" },
  { to: "/faq", label: "FAQ", sub: "Product & privacy" },
  { to: "/interview/new", label: "New interview", sub: "Start a session", primary: true },
];

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getAllInterviews()
      .then(({ data }) => setInterviews(data))
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Couldn’t load your interviews."));
      })
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
  const inProgress = interviews.filter((i) => i.status === "in_progress");
  const completedSorted = [...completed].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const scoreTrend = completedSorted.map((i) => i.overallScore).filter((v) => typeof v === "number");
  const scoreLast = scoreTrend.slice(-8);

  const eyeTrend = completedSorted.map((i) => i.avgEyeContact).filter((v) => typeof v === "number");
  const eyeLast = eyeTrend.slice(-8);

  const paceTrend = completedSorted.map((i) => i.avgPace).filter((v) => typeof v === "number");
  const paceLast = paceTrend.slice(-8);

  const confTrend = completedSorted.map((i) => i.avgConfidence).filter((v) => typeof v === "number");
  const confLast = confTrend.slice(-8);
  const avgScore =
    completed.filter((i) => i.overallScore !== null).length > 0
      ? (
          completed.filter((i) => i.overallScore !== null).reduce((s, i) => s + i.overallScore, 0) /
          completed.filter((i) => i.overallScore !== null).length
        ).toFixed(1)
      : null;

  const firstName = user?.name?.split(" ")[0] || "Candidate";
  const greeting = greetingForNow();

  const stats = [
    { label: statMeta[0].label, value: interviews.length, hint: statMeta[0].hint, accent: statMeta[0].accent, icon: statMeta[0].icon },
    { label: statMeta[1].label, value: completed.length, hint: statMeta[1].hint, accent: statMeta[1].accent, icon: statMeta[1].icon },
    { label: statMeta[2].label, value: inProgress.length, hint: statMeta[2].hint, accent: statMeta[2].accent, icon: statMeta[2].icon },
    { label: statMeta[3].label, value: avgScore ?? "—", hint: statMeta[3].hint, accent: statMeta[3].accent, icon: statMeta[3].icon },
  ];

  const hasInterviews = interviews.length > 0;
  const recent = [...interviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  const practiceStreak = !loading ? computePracticeStreak(interviews) : 0;
  const weekCount = !loading ? countCompletedThisWeek(interviews) : 0;
  const weekPct = Math.min(100, Math.round((weekCount / WEEKLY_SESSION_GOAL) * 100));

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/90 p-8 shadow-lux-lg ring-1 ring-white/80 dark:border-slate-700/80 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/80 dark:shadow-none dark:ring-slate-800/50 sm:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-aura-coral/20 to-transparent blur-3xl dark:from-aura-coral/12"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-gradient-to-tr from-aura-violet/15 to-transparent blur-3xl dark:from-aura-violet/10"
          aria-hidden
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Workspace</p>
            <h1 className="font-display text-3xl font-semibold italic tracking-tight text-aura-ink sm:text-4xl md:text-[2.65rem] md:leading-[1.05]">
              {greeting},{" "}
              <span className="not-italic bg-gradient-to-r from-aura-coral to-aura-violet bg-clip-text text-transparent">{firstName}</span>
            </h1>
            {user?.email && (
              <p className="mt-2 max-w-lg truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            )}
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              One place for every mock round — scores, presence metrics, and exports so you rehearse with intent, not hope.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row">
            <Link to="/interview/new" className="no-underline">
              <span className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-10px_rgba(157,80,187,0.45),0_0_0_1px_rgba(255,255,255,0.1)_inset] transition-transform duration-250 ease-out-expo active:scale-[0.98] sm:w-auto">
                <span className="absolute inset-0 bg-gradient-to-br from-aura-coral via-fuchsia-500/90 to-aura-violet" />
                <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
                <span className="relative">New interview</span>
                <span className="relative transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </Link>
            <Link to="/pricing" className="no-underline">
              <span className="btn-secondary inline-flex w-full justify-center py-3.5 text-sm sm:w-auto sm:px-6">View plans</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI strip — always visible */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-panel interactive-lift relative flex flex-col overflow-hidden rounded-2xl p-6 text-left sm:p-7"
          >
            <span className="absolute right-4 top-4 text-2xl opacity-[0.1] dark:opacity-[0.15]" aria-hidden>
              {s.icon}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{s.label}</p>
            <div className={`mt-2 font-sans text-3xl font-extrabold tabular-nums tracking-tight ${s.accent}`}>{s.value}</div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Practice rhythm — streak + weekly goal (client-side from session dates) */}
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <div className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-aura-coral/15 blur-2xl dark:bg-aura-coral/10" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Streak</p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <span className="font-brand text-4xl font-semibold tabular-nums tracking-tight text-aura-ink dark:text-white">
              {loading ? "—" : practiceStreak}
            </span>
            {!loading && (
              <span className="mb-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                {practiceStreak === 1 ? "day in a row" : "days in a row"}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {loading
              ? "Calculating from your completed sessions…"
              : practiceStreak === 0
                ? "Complete a session today or yesterday to start a streak."
                : "Keep the chain: at least one completed session per calendar day."}
          </p>
        </div>
        <div className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-7">
          <div className="pointer-events-none absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-aura-violet/15 blur-2xl dark:bg-aura-violet/10" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Weekly goal</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="font-brand text-4xl font-semibold tabular-nums tracking-tight text-aura-ink dark:text-white">
                {loading ? "—" : `${weekCount}/${WEEKLY_SESSION_GOAL}`}
              </span>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completed sessions this week (Mon–Sun)</p>
            </div>
            {!loading && weekCount >= WEEKLY_SESSION_GOAL && (
              <span className="mb-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-200">
                On track
              </span>
            )}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aura-coral to-aura-violet transition-[width] duration-500 ease-out"
              style={{ width: loading ? "0%" : `${weekPct}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {loading
              ? "Syncing this week’s completed sessions…"
              : weekCount >= WEEKLY_SESSION_GOAL
                ? "Goal hit — optional extra reps compound faster."
                : `${WEEKLY_SESSION_GOAL - weekCount} more to hit the weekly bar.`}
          </p>
        </div>
      </div>

      {/* Momentum — always show panel (avoids layout jump while loading) */}
      <div className="glass-panel-lg mb-10 min-w-0 overflow-hidden p-6 md:p-8">
        <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-4">
          <div>
            <span className="section-eyebrow mb-3">Momentum</span>
            <h2 className="text-xl font-bold tracking-tight text-aura-ink">Overall score trend</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {loading
                ? "Loading session history…"
                : scoreLast.length >= 2
                  ? `Last ${scoreLast.length} completed sessions`
                  : "Your line chart unlocks after two completed sessions"}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="h-[88px] w-full animate-pulse rounded-xl bg-slate-100/90 dark:bg-slate-800/60" aria-hidden />
        ) : scoreLast.length >= 2 ? (
          <div className="min-w-0">
            <Sparkline data={scoreLast} stroke="#9D50BB" fill="rgba(157,80,187,0.14)" />
          </div>
        ) : (
          <TrendPlaceholder />
        )}

        {!loading && scoreLast.length >= 2 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 ring-1 ring-white/60 dark:border-slate-700/70 dark:bg-slate-900/40 dark:ring-slate-800/40">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Eye contact</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{eyeLast.at(-1) != null ? `${eyeLast.at(-1)}%` : "—"}</div>
              </div>
              {eyeLast.length >= 2 ? (
                <Sparkline data={eyeLast} stroke="#10b981" fill="rgba(16,185,129,0.10)" />
              ) : (
                <div className="h-[44px] rounded-xl bg-slate-100/80 dark:bg-slate-800/50" aria-hidden />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 ring-1 ring-white/60 dark:border-slate-700/70 dark:bg-slate-900/40 dark:ring-slate-800/40">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Pace</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{paceLast.at(-1) != null ? `${paceLast.at(-1)} wpm` : "—"}</div>
              </div>
              {paceLast.length >= 2 ? (
                <Sparkline data={paceLast} stroke="#f59e0b" fill="rgba(245,158,11,0.12)" />
              ) : (
                <div className="h-[44px] rounded-xl bg-slate-100/80 dark:bg-slate-800/50" aria-hidden />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 ring-1 ring-white/60 dark:border-slate-700/70 dark:bg-slate-900/40 dark:ring-slate-800/40">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Confidence</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{confLast.at(-1) != null ? `${confLast.at(-1)}/10` : "—"}</div>
              </div>
              {confLast.length >= 2 ? (
                <Sparkline data={confLast} stroke="#ec4899" fill="rgba(236,72,153,0.10)" />
              ) : (
                <div className="h-[44px] rounded-xl bg-slate-100/80 dark:bg-slate-800/50" aria-hidden />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        {/* Main column */}
        <div className="min-w-0 lg:col-span-2">
          {loading ? (
            <DashboardSkeleton />
          ) : !hasInterviews ? (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50/95 via-white to-violet-50/30 p-8 shadow-lux dark:border-slate-700/80 dark:from-slate-900/80 dark:via-slate-950 dark:to-violet-950/20 dark:shadow-none sm:p-10">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-aura-violet/10 blur-2xl" aria-hidden />
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-aura-violet">Runway</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-aura-ink sm:text-3xl">
                  Your first session defines the <span className="italic text-gradient">baseline</span>
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                  We tailor technical questions to your resume, score answers deterministically, and coach gaze and pace in real time — so every rep sharpens the same skills you need on camera with a hiring manager.
                </p>
                <Link to="/interview/new" className="mt-8 inline-block no-underline">
                  <span className="btn-cta inline-flex px-10 py-4 text-[15px] shadow-[0_14px_44px_-10px_rgba(15,23,42,0.35)] dark:shadow-[0_14px_44px_-10px_rgba(0,0,0,0.5)]">
                    Start your first interview <span aria-hidden>→</span>
                  </span>
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {RUNWAY_STEPS.map((step) => (
                  <div
                    key={step.n}
                    className="glass-panel rounded-2xl p-6 transition-[border-color,box-shadow] duration-350 ease-out-expo hover:border-slate-300/90 dark:hover:border-slate-600/80"
                  >
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{step.n}</span>
                    <h3 className="mt-2 text-base font-bold tracking-tight text-aura-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.body}</p>
                  </div>
                ))}
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
                  transition: { staggerChildren: 0.06, delayChildren: 0.02 },
                },
              }}
            >
              <div className="mb-1 flex items-end justify-between gap-4">
                <h2 className="text-lg font-bold tracking-tight text-aura-ink">Sessions</h2>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{interviews.length} total</span>
              </div>
              {interviews.map((iv) => {
                const answered = iv.questions?.filter((q) => q.score !== null).length || 0;
                const total = iv.questions?.length || 0;
                const pct = total > 0 ? (answered / total) * 100 : 0;
                const to = iv.status === "completed" ? `/interview/${iv._id}/report` : `/interview/${iv._id}`;

                return (
                  <motion.div
                    key={iv._id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-1 shadow-lux transition-[box-shadow,border-color] duration-350 ease-out-expo hover:border-slate-300/95 hover:shadow-[0_32px_64px_-24px_rgba(15,23,42,0.12)] dark:border-slate-700/80 dark:bg-slate-900/50 dark:hover:border-slate-600/80 dark:hover:shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45)]"
                  >
                    <div className="flex flex-col rounded-[0.9rem] bg-gradient-to-br from-white/80 to-slate-50/30 p-5 dark:from-slate-900/60 dark:to-slate-950/40 md:flex-row md:items-stretch md:gap-0 md:p-6">
                      <Link
                        to={to}
                        className="group flex min-w-0 flex-1 flex-wrap items-center gap-5 text-inherit no-underline md:flex-nowrap md:gap-6"
                      >
                        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 px-2 py-3 dark:border-slate-600/80 dark:bg-slate-900/80">
                          <ScoreDisplay score={iv.overallScore} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold tracking-tight text-aura-ink transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300">
                              {iv.jobRole}
                            </span>
                            <StatusBadge status={iv.status} />
                          </div>
                          <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {new Date(iv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {" · "}
                            {answered}/{total} scored
                          </p>
                          <div className="progress-track max-w-xl">
                            <div className="progress-fill-bar" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {iv.avgEyeContact !== null && iv.avgEyeContact !== undefined && (
                          <div className="flex min-w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2 text-center dark:border-slate-600/60 dark:bg-slate-900/50">
                            <span
                              className={`text-lg font-bold tabular-nums leading-none ${
                                iv.avgEyeContact > 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {iv.avgEyeContact}
                              <span className="text-sm font-semibold">%</span>
                            </span>
                            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                              Gaze
                            </span>
                          </div>
                        )}

                        <div className="hidden shrink-0 items-center pr-2 md:flex" aria-hidden>
                          <span className="rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors group-hover:border-violet-200 group-hover:text-violet-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:border-violet-500/40 dark:group-hover:text-violet-200">
                            {iv.status === "completed" ? "Open report" : "Continue"}
                            <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
                          </span>
                        </div>
                      </Link>

                      <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-700/80 md:ml-4 md:mt-0 md:w-28 md:flex-col md:justify-center md:border-l md:border-t-0 md:pl-4 md:pt-0">
                        <button
                          type="button"
                          className="rounded-full border border-transparent px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800 dark:hover:border-rose-500/30 dark:hover:bg-rose-950/40 dark:hover:text-rose-200"
                          onClick={(e) => handleDelete(iv._id, e)}
                          disabled={deleting === iv._id}
                          aria-busy={deleting === iv._id}
                          aria-label={deleting === iv._id ? "Deleting interview" : `Delete interview for ${iv.jobRole}`}
                        >
                          {deleting === iv._id ? <span className="spinner h-4 w-4" /> : "Remove"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-6 lg:col-span-1">
          <div className="glass-panel-lg rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-tight text-aura-ink">Quick links</h3>
            <ul className="mt-4 space-y-1">
              {SIDEBAR_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium no-underline transition-colors ${
                      item.primary
                        ? "bg-gradient-to-r from-aura-coral/12 to-aura-violet/10 text-aura-ink hover:from-aura-coral/18 hover:to-aura-violet/14 dark:from-aura-coral/15 dark:to-aura-violet/12"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">{item.sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-tight text-aura-ink">Practice signal</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Recruiters weight three things in the first minutes: clarity, confidence, and camera presence. Your dashboard tracks all three.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <span className="text-emerald-500" aria-hidden>
                  ✓
                </span>
                <span>Ground every answer in metrics and tradeoffs, not buzzwords.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500" aria-hidden>
                  ✓
                </span>
                <span>Keep WPM in a conversational band — we flag pace drift live.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500" aria-hidden>
                  ✓
                </span>
                <span>Rebuild eye contact as a habit before it is scored for real.</span>
              </li>
            </ul>
          </div>

          {!loading && hasInterviews && (
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold tracking-tight text-aura-ink">Recent</h3>
              <ul className="mt-3 space-y-3">
                {recent.map((iv) => (
                  <li key={iv._id}>
                    <Link
                      to={iv.status === "completed" ? `/interview/${iv._id}/report` : `/interview/${iv._id}`}
                      className="block rounded-lg py-1 no-underline transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="block truncate text-sm font-semibold text-aura-ink">{iv.jobRole}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-500">
                        {new Date(iv.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
