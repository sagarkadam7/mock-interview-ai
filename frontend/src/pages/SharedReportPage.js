import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getSharedReport } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { RadarChart, Sparkline } from "../components/Charts";

function ReportPageSkeleton() {
  return (
    <div className="page-shell min-h-screen max-w-6xl" aria-busy="true" aria-label="Loading shared report">
      <div className="glass-panel-lg mb-10 overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="h-3 w-28 skeleton-line" />
            <div className="h-9 w-[66%] max-w-md skeleton-line" />
            <div className="h-3 w-56 skeleton-line" />
          </div>
          <div className="h-24 w-24 shrink-0 rounded-full skeleton-line" />
        </div>
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl skeleton-line" />
          ))}
        </div>
        <div className="mb-8 h-72 w-full max-w-2xl rounded-3xl skeleton-line mx-auto" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 w-full rounded-3xl skeleton-line" />
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">Preparing report…</p>
    </div>
  );
}

const scoreColor = (s) =>
  s >= 7 ? "text-emerald-600" : s >= 4 ? "text-amber-600" : s !== null ? "text-rose-600" : "text-slate-400";
const eyeColor = (p) => (p > 70 ? "text-emerald-600" : p > 40 ? "text-amber-600" : "text-rose-600");
const paceColor = (l) => (l === "good" ? "text-emerald-600" : "text-amber-600");
const emotionEmoji = { happy: "😊", neutral: "😐", sad: "😔", fearful: "😰", angry: "😠", disgusted: "🤢", surprised: "😲" };

function StatCard({ label, value, sub, colorClass }) {
  return (
    <div className="glass-panel rounded-2xl p-6 text-center ring-1 ring-white/40">
      <div className={`mb-1 font-sans text-3xl font-bold tracking-tight ${colorClass || "text-violet-600"}`}>{value ?? "—"}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, barClass }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full transition-all duration-500 ${barClass || "bg-aura-violet"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function EmotionBar({ emotions }) {
  if (!emotions) return null;
  const entries = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  return (
    <div className="flex flex-col gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2.5">
          <span className="w-5 text-center text-sm">{emotionEmoji[k] || "😐"}</span>
          <span className="w-16 shrink-0 text-xs capitalize text-aura-muted">{k}</span>
          <MiniBar
            value={v}
            max={1}
            barClass={
              k === "happy" || k === "neutral"
                ? "bg-emerald-500"
                : k === "fearful" || k === "sad"
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }
          />
          <span className="w-9 text-right text-[11px] text-aura-muted">{Math.round(v * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

function QuestionCard({ question, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="glass-panel overflow-hidden rounded-3xl transition-all duration-300 hover:border-slate-300">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 border-none bg-transparent p-6 text-left transition-all duration-300 hover:bg-slate-50/80 md:p-8"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {question.questionType === "follow_up" && (
              <span className="inline-block rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                Adaptive follow-up
              </span>
            )}
            <p className="text-[15px] font-medium leading-snug tracking-tight text-aura-ink">{question.text}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {question.score !== null && (
            <span className={`font-sans text-xl font-bold ${scoreColor(question.score)}`}>
              {question.score}
              <span className="text-xs font-normal text-aura-muted">/10</span>
            </span>
          )}
          {question.eyeContactPct !== null && (
            <span className={`text-xs font-medium ${eyeColor(question.eyeContactPct)}`}>👁 {question.eyeContactPct}%</span>
          )}
          <span className="text-aura-muted">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 pb-6 pt-2 md:px-8 md:pb-8">
          {(question.eyeContactPct !== null ||
            question.wordsPerMinute > 0 ||
            question.fillerWordCount !== null ||
            question.confidenceScore !== null) && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {question.eyeContactPct !== null && (
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">👁 Eye</div>
                  <div className={`text-lg font-bold ${eyeColor(question.eyeContactPct)}`}>{question.eyeContactPct}%</div>
                </div>
              )}
              {question.wordsPerMinute > 0 && (
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">📊 Pace</div>
                  <div className={`text-sm font-bold ${paceColor(question.paceLabel)}`}>{question.wordsPerMinute} wpm</div>
                  <div className="text-[10px] capitalize text-aura-muted">{question.paceLabel}</div>
                </div>
              )}
              {question.fillerWordCount !== null && (
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">🗣 Fillers</div>
                  <div
                    className={`text-lg font-bold ${
                      question.fillerWordCount > 5 ? "text-rose-600" : question.fillerWordCount > 2 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {question.fillerWordCount}
                  </div>
                </div>
              )}
              {question.confidenceScore !== null && (
                <div className="rounded-xl border border-aura-violet/30 bg-aura-violet/10 p-3 text-center">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-coral">⭐ Conf</div>
                  <div className="text-base font-bold text-aura-ink">{question.confidenceScore}/10</div>
                </div>
              )}
            </div>
          )}

          {question.dominantEmotion && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Expression analysis</div>
              <EmotionBar emotions={question.emotionScores} />
            </div>
          )}

          {question.answer ? (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Candidate answer</div>
              <p className="text-sm italic leading-relaxed text-slate-700">&quot;{question.answer}&quot;</p>
            </div>
          ) : (
            <p className="text-sm italic text-aura-muted">No answer recorded.</p>
          )}

          <div className="h-px bg-slate-100" />

          {question.feedback && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-aura-coral">AI Feedback</div>
              <p className="text-sm leading-relaxed text-slate-700">{question.feedback}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {question.strengths && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">✓ Strengths</div>
                <p className="text-sm leading-relaxed text-slate-700">{question.strengths}</p>
              </div>
            )}
            {question.improvements && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-400">↑ Improvements</div>
                <p className="text-sm leading-relaxed text-slate-700">{question.improvements}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SharedReportPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSharedReport(token)
      .then(({ data }) => {
        if (!cancelled) setInterview(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, "Couldn’t load this shared report."));
          navigate("/", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  if (loading) return <ReportPageSkeleton />;
  if (!interview) return null;

  const answered = interview.questions?.filter((q) => q.score !== null) || [];
  const overall = interview.overallScore;

  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const eyeN = interview.avgEyeContact !== null ? clamp01(interview.avgEyeContact / 100) : 0;
  const confN = interview.avgConfidence !== null ? clamp01(interview.avgConfidence / 10) : 0;
  const paceN = interview.avgPace ? clamp01(1 - Math.abs(interview.avgPace - 150) / 100) : 0;
  const fillerN = interview.avgFillerWords !== null ? clamp01(1 - interview.avgFillerWords / 10) : 0;
  const overallN = overall !== null ? clamp01(overall / 10) : 0;

  const radarMetrics = [
    { label: "Eye", normalized: eyeN },
    { label: "Conf", normalized: confN },
    { label: "Pace", normalized: paceN },
    { label: "Fill", normalized: fillerN },
    { label: "Overall", normalized: overallN },
  ];

  const questionScores = (interview.questions || []).map((q) => q.score).filter((s) => typeof s === "number");
  const eyeTrend = (interview.questions || []).map((q) => q.eyeContactPct).filter((p) => typeof p === "number");

  return (
    <div className="page-shell min-h-screen max-w-6xl">
      <div className="glass-panel-lg relative mb-10 overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-orange-50/30 opacity-90" aria-hidden />
        <div className="relative mb-10 flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Shared report</div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">{interview.jobRole}</h1>
            <p className="mt-1 text-sm text-aura-muted">
              {new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="mt-1 text-sm text-aura-muted">
              {answered.length}/{interview.questions?.length || 0} questions answered
            </p>
          </div>
          {overall !== null && (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border-[3px] border-slate-200 bg-white/80">
                <span className={`font-sans text-3xl font-bold leading-none ${scoreColor(overall)}`}>{overall}</span>
                <span className="text-[10px] text-aura-muted">/10</span>
              </div>
              <p className="mt-2 text-[11px] text-aura-muted">AI content score</p>
            </div>
          )}
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Avg eye contact"
            value={interview.avgEyeContact !== null ? `${interview.avgEyeContact}%` : null}
            colorClass={interview.avgEyeContact > 70 ? "text-emerald-600" : interview.avgEyeContact > 40 ? "text-amber-600" : "text-rose-600"}
          />
          <StatCard label="Avg confidence (ML)" value={interview.avgConfidence !== null ? `${interview.avgConfidence}/10` : null} colorClass="text-violet-600" />
          <StatCard
            label="Avg speech pace"
            value={interview.avgPace ? `${interview.avgPace} wpm` : null}
            sub={interview.avgPace ? (interview.avgPace >= 100 && interview.avgPace <= 180 ? "good pace" : "needs adjustment") : null}
            colorClass={interview.avgPace >= 100 && interview.avgPace <= 180 ? "text-emerald-600" : "text-amber-600"}
          />
          <StatCard
            label="Avg filler words / Q"
            value={interview.avgFillerWords !== null ? interview.avgFillerWords : null}
            colorClass={interview.avgFillerWords <= 2 ? "text-emerald-600" : interview.avgFillerWords <= 5 ? "text-amber-600" : "text-rose-600"}
          />
        </div>

        <div className="glass-panel mb-8 rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="mb-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-aura-muted">
                Metric radar
              </span>
              <h2 className="text-xl font-bold tracking-tight text-aura-ink">Coaching snapshot</h2>
              <p className="mt-1 text-sm text-aura-muted">Larger shape = better performance for that dimension.</p>
            </div>
          </div>
          <RadarChart metrics={radarMetrics} stroke="#FF7E5F" fill="rgba(157,80,187,0.14)" />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-panel rounded-2xl p-6">
            <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Trends</span>
            <h3 className="mb-3 text-lg font-bold tracking-tight text-aura-ink">Question score</h3>
            {questionScores.length >= 2 ? <Sparkline data={questionScores} stroke="#9D50BB" fill="rgba(157,80,187,0.12)" /> : <p className="text-sm text-aura-muted">Not enough scores yet.</p>}
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Trends</span>
            <h3 className="mb-3 text-lg font-bold tracking-tight text-aura-ink">Eye contact</h3>
            {eyeTrend.length >= 2 ? <Sparkline data={eyeTrend} stroke="#34d399" fill="rgba(16,185,129,0.10)" /> : <p className="text-sm text-aura-muted">No eye contact data yet.</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-aura-muted">Want your own sessions, reports, and practice history?</p>
          <Link to="/register">
            <button type="button" className="btn-primary">
              Create free account →
            </button>
          </Link>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold tracking-tight text-aura-ink">Question-by-question breakdown</h2>
      <div className="flex flex-col gap-4">
        {(interview.questions || []).map((q, i) => (
          <QuestionCard key={q._id || i} question={q} index={i} />
        ))}
      </div>
    </div>
  );
}

