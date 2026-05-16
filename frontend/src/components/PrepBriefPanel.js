import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { generatePrepBrief } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";

function matchScoreRingClass(score) {
  if (score >= 75) return "from-emerald-500 to-emerald-600";
  if (score >= 50) return "from-amber-500 to-amber-600";
  return "from-rose-500 to-rose-600";
}

function severityBadge(severity) {
  const s = String(severity || "medium").toLowerCase();
  if (s === "high") return "bg-rose-500/15 text-rose-800 dark:text-rose-200";
  if (s === "low") return "bg-slate-500/10 text-slate-600 dark:text-slate-300";
  return "bg-amber-500/15 text-amber-900 dark:text-amber-100";
}

export default function PrepBriefPanel({ interviewId, prepBrief, onBriefUpdate, readOnly = false, defaultOpen = true }) {
  const { user } = useAuth();
  const plan = (user?.plan || "free").toLowerCase();
  const isPro = plan === "pro" || plan === "team";
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);

  const brief = prepBrief || { status: "none" };
  const isReady = brief.status === "ready" && brief.matchScore != null;

  const handleGenerate = async (force = false) => {
    if (!isPro) {
      toast.error("AI Prep Brief is included with Pro.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await generatePrepBrief(interviewId, { force });
      onBriefUpdate?.(data.prepBrief);
      toast.success(force ? "Prep brief refreshed." : "Prep brief ready — review gaps before you answer.");
    } catch (err) {
      const code = err.response?.data?.code;
      if (err.response?.status === 402 || code === "PREP_BRIEF_PRO_ONLY") {
        toast.error("Upgrade to Pro to unlock AI Prep Brief.");
      } else {
        toast.error(getApiErrorMessage(err, "Couldn’t generate prep brief."));
      }
    } finally {
      setLoading(false);
    }
  };

  const panelId = `prep-brief-${interviewId}`;
  const headerId = `${panelId}-header`;

  return (
    <div
      className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/40 via-white/95 to-white/90 shadow-sm ring-1 ring-violet-100/60 dark:border-violet-500/25 dark:from-violet-950/30 dark:via-slate-900/90 dark:to-slate-950/90 dark:ring-violet-900/30"
      id={panelId}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-violet-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 dark:hover:bg-violet-950/30 dark:focus-visible:ring-offset-slate-950"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${panelId}-body`}
        id={headerId}
      >
        <PrepBriefHeader isReady={isReady} brief={brief} />
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-200/80 bg-white/90 text-slate-500 transition-transform duration-200 dark:border-violet-500/30 dark:bg-slate-900/80 dark:text-slate-400 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <PrepBriefBody
          id={`${panelId}-body`}
          labelledBy={headerId}
          isReady={isReady}
          brief={brief}
          readOnly={readOnly}
          isPro={isPro}
          loading={loading}
          onGenerate={() => handleGenerate(false)}
          onRegenerate={() => handleGenerate(true)}
        />
      ) : null}
    </div>
  );
}

function PrepBriefHeader({ isReady, brief }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Pro · AI Prep Brief</p>
      <p className="mt-0.5 text-sm font-semibold text-aura-ink dark:text-slate-100">
        {isReady ? `Resume fit · ${brief.matchScore}%` : "Resume vs job description"}
      </p>
    </div>
  );
}

function PrepBriefBody({ id, labelledBy, isReady, brief, readOnly, isPro, loading, onGenerate, onRegenerate }) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className="border-t border-violet-200/60 px-4 pb-4 pt-1 dark:border-violet-800/40"
    >
      {!isReady ? (
        <PrepBriefEmpty readOnly={readOnly} isPro={isPro} loading={loading} onGenerate={onGenerate} />
      ) : (
        <PrepBriefContent brief={brief} readOnly={readOnly} isPro={isPro} loading={loading} onRegenerate={onRegenerate} />
      )}
    </div>
  );
}

function PrepBriefEmpty({ readOnly, isPro, loading, onGenerate }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
        Get a match score, gap analysis, and STAR stories to rehearse — tailored to this role and JD before you hit record.
      </p>
      {!readOnly &&
        (isPro ? (
          <button type="button" className="btn-cta w-full justify-center py-2.5 text-sm" onClick={onGenerate} disabled={loading}>
            {loading ? "Analyzing resume…" : "Generate prep brief"}
          </button>
        ) : (
          <PrepBriefUpgrade />
        ))}
    </div>
  );
}

function PrepBriefUpgrade() {
  return (
    <div className="rounded-xl border border-violet-200/70 bg-white/80 p-3 dark:border-violet-500/20 dark:bg-slate-900/50">
      <p className="text-[13px] text-slate-600 dark:text-slate-400">Unlock resume–JD fit analysis with Pro.</p>
      <Link to="/pricing" className="mt-2 inline-flex text-sm font-semibold text-violet-700 no-underline hover:text-violet-900 dark:text-violet-300">
        View Pro plans →
      </Link>
    </div>
  );
}

function PrepBriefContent({ brief, readOnly, isPro, loading, onRegenerate }) {
  const score = brief.matchScore;
  const ringClass = matchScoreRingClass(score);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${ringClass} text-white shadow-md`}
          aria-label={`Resume match score ${score} percent`}
        >
          <span className="font-display text-2xl font-bold tabular-nums leading-none">{score}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">match</span>
        </div>
        <p className="flex-1 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{brief.summary}</p>
      </div>

      {brief.strengths?.length > 0 && (
        <section>
          <h4 className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Aligned</h4>
          <ul className="space-y-1.5">
            {brief.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-[13px] text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500" aria-hidden>
                  ✓
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.gaps?.length > 0 && (
        <section>
          <h4 className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-200">Gaps to address</h4>
          <ul className="space-y-2">
            {brief.gaps.map((g) => (
              <li key={`${g.area}-${g.tip}`} className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700/80 dark:bg-slate-900/40">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-aura-ink dark:text-slate-100">{g.area}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityBadge(g.severity)}`}>
                    {g.severity}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">{g.tip}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.starStories?.length > 0 && (
        <section>
          <h4 className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Stories to rehearse</h4>
          <ul className="space-y-2">
            {brief.starStories.map((s) => (
              <li key={s.title} className="rounded-xl border border-violet-200/50 bg-violet-50/30 p-3 dark:border-violet-500/20 dark:bg-violet-950/20">
                <p className="text-sm font-semibold text-aura-ink dark:text-slate-100">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">{s.prompt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.focusTips?.length > 0 && (
        <section>
          <h4 className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Interview day</h4>
          <ul className="list-disc space-y-1 pl-4 text-[13px] text-slate-600 dark:text-slate-400">
            {brief.focusTips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {!readOnly && isPro && (
        <button type="button" className="btn-outline w-full py-2 text-xs" onClick={onRegenerate} disabled={loading}>
          {loading ? "Refreshing…" : "Regenerate brief"}
        </button>
      )}
    </div>
  );
}
