import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getInterview, getAllInterviews, createShareToken, patchInterviewMeta, duplicateInterview } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { generatePDFReport } from "../utils/pdfReport";
import { buildNextRepsFromInterview, getSessionCoachingFocus } from "../utils/practiceSignals";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import { formatSessionWallDuration } from "../utils/formatSessionDuration";
import { RadarChart, Sparkline } from "../components/Charts";

function ReportPageSkeleton() {
  return (
    <div className="page-shell min-h-screen max-w-6xl" aria-busy="true" aria-label="Loading report">
      <div className="glass-panel-lg mb-10 overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="h-3 w-24 skeleton-line" />
            <div className="h-9 w-[66%] max-w-md skeleton-line" />
            <div className="h-3 w-48 skeleton-line" />
            <div className="h-3 w-40 skeleton-line" />
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
      <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">Preparing your report…</p>
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
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, barClass }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/80">
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
        className="flex w-full items-start justify-between gap-4 border-none bg-transparent p-6 text-left transition-all duration-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 md:p-8"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
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
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/70">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">👁 Eye</div>
                  <div className={`text-lg font-bold ${eyeColor(question.eyeContactPct)}`}>{question.eyeContactPct}%</div>
                </div>
              )}
              {question.wordsPerMinute > 0 && (
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/70">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">📊 Pace</div>
                  <div className={`text-sm font-bold ${paceColor(question.paceLabel)}`}>{question.wordsPerMinute} wpm</div>
                  <div className="text-[10px] capitalize text-aura-muted">{question.paceLabel}</div>
                </div>
              )}
              {question.fillerWordCount !== null && (
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/70">
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
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Your answer</div>
              <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">&quot;{question.answer}&quot;</p>
              {question.fillerWords?.length > 0 && (
                <p className="mt-2 text-xs text-aura-muted">
                  Filler words detected: {question.fillerWords.map((w) => `"${w}"`).join(", ")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-aura-muted">No answer recorded.</p>
          )}

          <div className="h-px bg-slate-100 dark:bg-slate-800/90" />

          {question.feedback && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-aura-coral">AI Feedback</div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{question.feedback}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {question.strengths && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">✓ Strengths</div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{question.strengths}</p>
              </div>
            )}
            {question.improvements && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-400">↑ Improvements</div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{question.improvements}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [peerList, setPeerList] = useState([]);
  const [duplicating, setDuplicating] = useState(false);
  const [prepNotes, setPrepNotes] = useState("");
  const [prepCompany, setPrepCompany] = useState("");
  const [sessionStarred, setSessionStarred] = useState(false);
  const [notesStatus, setNotesStatus] = useState("idle");
  const notesSyncedRef = useRef("");

  const loadReport = useCallback(async () => {
    setLoadError("");
    setLoading(true);
    try {
      const [{ data }, allRes] = await Promise.all([getInterview(id), getAllInterviews()]);
      setInterview(data);
      setPeerList(Array.isArray(allRes.data) ? allRes.data : []);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Couldn’t load this report.");
      setLoadError(msg);
      setInterview(null);
      setPeerList([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (!interview?.jobRole) return undefined;
    document.title = `${interview.jobRole} · Report · InterviewAI`;
    return undefined;
  }, [interview?.jobRole]);

  useEffect(() => {
    if (!interview?._id) return;
    setPrepNotes(interview.candidateNotes || "");
    setPrepCompany(interview.targetCompany || "");
    setSessionStarred(!!interview.starred);
    notesSyncedRef.current = interview.candidateNotes || "";
  }, [interview?._id]);

  useEffect(() => {
    if (!interview?._id || loading) return undefined;
    if (prepNotes === notesSyncedRef.current) return undefined;
    setNotesStatus("saving");
    const t = setTimeout(async () => {
      try {
        await patchInterviewMeta(id, { candidateNotes: prepNotes });
        notesSyncedRef.current = prepNotes;
        setInterview((prev) => (prev ? { ...prev, candidateNotes: prepNotes } : prev));
        setNotesStatus("saved");
        setTimeout(() => setNotesStatus("idle"), 1800);
      } catch (err) {
        setNotesStatus("error");
        toast.error(getApiErrorMessage(err, "Couldn’t save your notes."));
      }
    }, 900);
    return () => clearTimeout(t);
  }, [prepNotes, id, interview?._id, loading]);

  const onToggleStar = async () => {
    if (!interview?._id) return;
    const next = !sessionStarred;
    setSessionStarred(next);
    try {
      await patchInterviewMeta(id, { starred: next });
      setInterview((prev) => (prev ? { ...prev, starred: next } : prev));
      toast.success(next ? "Pinned on your dashboard" : "Removed from starred");
    } catch (err) {
      setSessionStarred(!next);
      toast.error(getApiErrorMessage(err, "Couldn’t update starred state."));
    }
  };

  const onSaveCompany = async () => {
    if (!interview?._id) return;
    const t = prepCompany.trim().slice(0, 120);
    if (t === (interview.targetCompany || "")) return;
    try {
      await patchInterviewMeta(id, { targetCompany: t });
      setPrepCompany(t);
      setInterview((prev) => (prev ? { ...prev, targetCompany: t } : prev));
      toast.success("Company label saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn’t save company label."));
    }
  };

  if (loading) {
    return <ReportPageSkeleton />;
  }

  if (loadError) {
    return (
      <div className="page-shell min-h-screen max-w-3xl py-16 md:py-20">
        <div className="glass-panel-lg overflow-hidden p-6 sm:p-8">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Report unavailable</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">We couldn’t load this report</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{loadError}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-cta px-8 py-3" onClick={loadReport}>
              Retry →
            </button>
            <button type="button" className="btn-outline px-8 py-3" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </button>
            <Link to="/interview/new" className="no-underline">
              <span className="btn-primary px-8 py-3">Start a new session</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const answered = interview.questions.filter((q) => q.score !== null);
  const overall = interview.overallScore;

  const peerCompleted = peerList.filter(
    (row) => String(row._id) !== String(interview._id) && row.status === "completed" && typeof row.overallScore === "number"
  );
  const peerAvgScore =
    peerCompleted.length > 0 ? peerCompleted.reduce((s, r) => s + r.overallScore, 0) / peerCompleted.length : null;
  const scoreVsPeer =
    peerAvgScore != null && overall != null ? Math.round((overall - peerAvgScore) * 10) / 10 : null;

  const weakPrimary = [...interview.questions]
    .filter((q) => (q.questionType || "primary") === "primary" && typeof q.score === "number")
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  const sessionWall = formatSessionWallDuration(interview.firstAnsweredAt, interview.completedAt);

  const onDuplicateSession = async () => {
    setDuplicating(true);
    try {
      const { data } = await duplicateInterview(id);
      toast.success("Fresh questions ready — opening new session.");
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn’t duplicate this session."));
    } finally {
      setDuplicating(false);
    }
  };
  const overallRing =
    overall >= 7
      ? "border-emerald-400 bg-emerald-50"
      : overall >= 4
        ? "border-amber-400 bg-amber-50"
        : "border-rose-400 bg-rose-50";
  const overallText = overall >= 7 ? "text-emerald-700" : overall >= 4 ? "text-amber-700" : "text-rose-700";

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

  const focusDim = getSessionCoachingFocus(interview);
  const nextRepsBullets = buildNextRepsFromInterview(interview);

  const copyText = async (text, successMsg) => {
    try {
      setCopying(true);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(successMsg);
      } else {
        window.prompt("Copy this text:", text);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn’t copy to clipboard."));
    } finally {
      setCopying(false);
    }
  };

  const questionScores = interview.questions.map((q) => q.score).filter((s) => typeof s === "number");
  const eyeTrend = interview.questions.map((q) => q.eyeContactPct).filter((p) => typeof p === "number");

  return (
    <div className="page-shell min-h-screen max-w-6xl">
      <div className="glass-panel-lg relative mb-10 overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-orange-50/30 opacity-90" aria-hidden />
        <div className="relative mb-10 flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0 flex-1">
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Session report</div>
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">{interview.jobRole}</h1>
              <button
                type="button"
                onClick={onToggleStar}
                className={`mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition-colors ${
                  sessionStarred
                    ? "border-amber-300/80 bg-amber-50 text-amber-800 shadow-sm dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100"
                    : "border-slate-200/90 bg-white/90 text-slate-400 hover:border-violet-300 hover:text-violet-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-500 dark:hover:text-violet-300"
                }`}
                aria-pressed={sessionStarred}
                aria-label={sessionStarred ? "Remove star from dashboard" : "Star this session on dashboard"}
                title={sessionStarred ? "Starred on dashboard" : "Star on dashboard"}
              >
                {sessionStarred ? "★" : "☆"}
              </button>
            </div>
            {(prepCompany || interview.targetCompany) ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                {prepCompany || interview.targetCompany}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-aura-muted">
              {new Date(interview.createdAt).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              <span className="text-slate-400 dark:text-slate-500"> · {formatRelativeTime(interview.createdAt)}</span>
            </p>
            <p className="mt-1 text-sm text-aura-muted">
              {answered.length}/{interview.questions.length} questions answered
            </p>
            {sessionWall ? (
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">Wall time in session: {sessionWall}</p>
            ) : null}
          </div>
          {overall !== null && (
            <div className="text-center">
              <div className={`mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border-[3px] ${overallRing}`}>
                <span className={`font-sans text-3xl font-bold leading-none ${overallText}`}>{overall}</span>
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
            colorClass={
              interview.avgEyeContact > 70 ? "text-emerald-600" : interview.avgEyeContact > 40 ? "text-amber-600" : "text-rose-600"
            }
          />
          <StatCard
            label="Avg confidence (ML)"
            value={interview.avgConfidence !== null ? `${interview.avgConfidence}/10` : null}
            colorClass="text-violet-600"
          />
          <StatCard
            label="Avg speech pace"
            value={interview.avgPace ? `${interview.avgPace} wpm` : null}
            sub={interview.avgPace ? (interview.avgPace >= 100 && interview.avgPace <= 180 ? "good pace" : "needs adjustment") : null}
            colorClass={interview.avgPace >= 100 && interview.avgPace <= 180 ? "text-emerald-600" : "text-amber-600"}
          />
          <StatCard
            label="Avg filler words / Q"
            value={interview.avgFillerWords !== null ? interview.avgFillerWords : null}
            colorClass={
              interview.avgFillerWords <= 2 ? "text-emerald-600" : interview.avgFillerWords <= 5 ? "text-amber-600" : "text-rose-600"
            }
          />
        </div>

        {(peerAvgScore != null && scoreVsPeer != null) || weakPrimary.length > 0 ? (
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {peerAvgScore != null && scoreVsPeer != null ? (
              <div className="glass-panel rounded-3xl p-6 md:p-7">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Benchmark</span>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">This session vs your average</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Avg overall score across your other <span className="font-semibold text-aura-ink dark:text-slate-200">{peerCompleted.length}</span>{" "}
                  completed session{peerCompleted.length === 1 ? "" : "s"}:{" "}
                  <span className="font-bold tabular-nums text-violet-600 dark:text-violet-300">{peerAvgScore.toFixed(1)}</span>
                  <span className="text-aura-muted"> /10</span>
                </p>
                <p className="mt-4 text-2xl font-black tabular-nums tracking-tight text-aura-ink dark:text-white">
                  {scoreVsPeer > 0 ? "+" : ""}
                  {scoreVsPeer}
                  <span className="ml-2 text-base font-semibold text-slate-500 dark:text-slate-400">vs avg</span>
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                  {scoreVsPeer >= 0.5
                    ? "Ahead of your recent baseline — keep pressure on delivery."
                    : scoreVsPeer <= -0.5
                      ? "Below your recent baseline — mine the per-question feedback for the gap."
                      : "Roughly on par with your recent baseline — tighten one axis next rep."}
                </p>
              </div>
            ) : null}
            {weakPrimary.length > 0 ? (
              <div className="glass-panel rounded-3xl border border-amber-200/60 bg-amber-50/30 p-6 dark:border-amber-500/25 dark:bg-amber-950/20 md:p-7">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200">Drill targets</span>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">Lowest-scoring primaries</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Re-answer these out loud before your next mock — same STAR depth, sharper metrics.</p>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-800 dark:text-slate-200">
                  {weakPrimary.map((q) => (
                    <li key={q._id} className="pl-1">
                      <span className="font-semibold text-rose-700 dark:text-rose-300">{q.score}/10</span>
                      <span className="text-slate-600 dark:text-slate-400"> — </span>
                      <span>{q.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="glass-panel mb-8 rounded-3xl border border-violet-200/50 bg-gradient-to-br from-violet-50/40 via-white to-white p-6 dark:border-violet-500/20 dark:from-violet-950/25 dark:via-slate-900/80 dark:to-slate-950 md:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="section-eyebrow mb-2">Private prep zone</span>
              <h2 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">Your next real loop</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Capture stories to tighten, questions to ask them, and reminders for the human round. Only you can see this — it is never included in share links.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                className="btn-outline px-3 py-2 text-xs"
                disabled={!prepNotes.trim() || copying}
                onClick={() => copyText(prepNotes, "Prep notes copied")}
              >
                Copy notes
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500" aria-live="polite">
                {notesStatus === "saving" && "Saving…"}
                {notesStatus === "saved" && "Saved"}
                {notesStatus === "error" && "Save failed"}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="prep-target-company" className="label-field">
              Target company or team
            </label>
            <input
              id="prep-target-company"
              className="input-field max-w-xl"
              value={prepCompany}
              onChange={(e) => setPrepCompany(e.target.value.slice(0, 120))}
              onBlur={onSaveCompany}
              placeholder="e.g. Meta, Series B startup, client name"
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="prep-notes" className="label-field">
              Prep notes
            </label>
            <textarea
              id="prep-notes"
              className="input-field min-h-[140px] resize-y"
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value.slice(0, 8000))}
              placeholder="What will you rehearse before the real interview? Metrics to add, weak follow-ups, questions for the panel…"
              maxLength={8000}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{prepNotes.length.toLocaleString()} / 8,000 · autosaves as you type</p>
          </div>
        </div>

        <div className="glass-panel mb-8 rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="mb-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-aura-muted dark:border-slate-600 dark:bg-slate-800/80">
                Metric radar
              </span>
              <h2 className="text-xl font-bold tracking-tight text-aura-ink">Your coaching snapshot</h2>
              <p className="mt-1 text-sm text-aura-muted">Larger shape = better performance for that dimension.</p>
            </div>
            <div className="max-w-[220px] text-right text-sm text-aura-muted">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-aura-muted">How to read</div>
              Eye: higher · Conf: higher · Pace: 130–170 wpm · Fillers: lower
            </div>
          </div>
          <RadarChart metrics={radarMetrics} stroke="#E85547" fill="rgba(91,33,182,0.14)" />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-aura-coral">Next focus</div>
                <div className={`mb-1 font-sans text-xl font-extrabold ${focusDim.accentClass}`}>{focusDim.key}</div>
                <p className="max-w-md text-sm leading-relaxed text-aura-muted">{focusDim.msg}</p>
              </div>
              <div className="text-right">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Your score</div>
                <div className={`font-sans text-3xl font-black ${focusDim.accentClass}`}>{Math.round(focusDim.value * 10)}/10</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-panel rounded-2xl p-6">
            <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Trends</span>
            <h3 className="mb-3 text-lg font-bold tracking-tight text-aura-ink">Question score</h3>
            {questionScores.length >= 2 ? (
              <Sparkline data={questionScores} stroke="#5B21B6" fill="rgba(91,33,182,0.12)" />
            ) : (
              <p className="text-sm text-aura-muted">Not enough scores yet.</p>
            )}
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Trends</span>
            <h3 className="mb-3 text-lg font-bold tracking-tight text-aura-ink">Eye contact</h3>
            {eyeTrend.length >= 2 ? (
              <Sparkline data={eyeTrend} stroke="#34d399" fill="rgba(16,185,129,0.10)" />
            ) : (
              <p className="text-sm text-aura-muted">No eye contact data yet.</p>
            )}
          </div>
        </div>

        {overall !== null && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-4 text-[15px] leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            {overall >= 8
              ? "🌟 Outstanding performance! You're interview-ready."
              : overall >= 6
                ? "👍 Good job overall! Focus on the improvement areas below."
                : overall >= 4
                  ? "📈 You're on the right track. Review the feedback carefully."
                  : "💪 Keep practicing! Every session makes you better."}
          </div>
        )}

        <div className="mb-8 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-violet-50/40 to-orange-50/30 p-6 shadow-inner dark:border-slate-700 dark:from-slate-900/90 dark:via-slate-950 dark:to-violet-950/25 md:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Next 7 minutes</p>
              <h2 className="mt-1 font-brand text-xl font-semibold tracking-tight text-aura-ink dark:text-white md:text-2xl">Your next reps</h2>
              <p className="mt-1 max-w-xl text-sm text-aura-muted">Close the loop while the session is still fresh — three focused actions, no new tooling.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-outline px-4 py-2 text-xs"
                disabled={copying}
                aria-busy={copying}
                onClick={() => {
                  const dateStr = new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  const text = [
                    `InterviewAI — Session summary`,
                    `Role: ${interview.jobRole}`,
                    `Date: ${dateStr}`,
                    `Overall: ${overall ?? "—"}/10`,
                    `Next focus: ${focusDim.key} (${Math.round(focusDim.value * 10)}/10)`,
                    "",
                    "Next reps:",
                    ...nextRepsBullets.map((x, i) => `${i + 1}. ${x}`),
                  ].join("\n");
                  copyText(text, "Session summary copied");
                }}
              >
                Copy summary
              </button>
              <button
                type="button"
                className="btn-outline px-4 py-2 text-xs"
                disabled={copying}
                aria-busy={copying}
                onClick={() => {
                  const text = nextRepsBullets.map((x, i) => `${i + 1}. ${x}`).join("\n");
                  copyText(text, "Next reps copied");
                }}
              >
                Copy reps
              </button>
            </div>
          </div>
          <ol className="list-none space-y-3 p-0">
            {nextRepsBullets.map((line, idx) => (
              <li
                key={idx}
                className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 text-[15px] leading-snug text-slate-800 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100"
              >
                <span className="font-mono text-xs font-bold tabular-nums text-aura-violet dark:text-violet-300">{String(idx + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">{line}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              generatePDFReport(interview);
              toast.success("PDF saved to your downloads");
            }}
          >
            ↓ Download PDF Report
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={duplicating}
            aria-busy={duplicating}
            title="Same resume, JD, and settings — new AI question set. Counts toward your monthly plan."
            onClick={onDuplicateSession}
          >
            {duplicating ? (
              <>
                <span className="spinner h-4 w-4" /> Generating…
              </>
            ) : (
              "⟲ Same setup, new questions"
            )}
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={sharing}
            aria-busy={sharing}
            onClick={async () => {
              try {
                setSharing(true);
                const { data } = await createShareToken(interview._id);
                const url = `${window.location.origin}/share/${data.token}`;
                if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(url);
                  toast.success("Share link copied");
                } else {
                  window.prompt("Copy this link:", url);
                }
              } catch (err) {
                toast.error(getApiErrorMessage(err, "Couldn’t create a share link."));
              } finally {
                setSharing(false);
              }
            }}
          >
            {sharing ? (
              <>
                <span className="spinner h-4 w-4" /> Creating link…
              </>
            ) : (
              "↗ Share report"
            )}
          </button>
          <Link to="/interview/new">
            <button type="button" className="btn-outline">
              + New Interview
            </button>
          </Link>
          <Link to="/dashboard">
            <button type="button" className="btn-outline">
              ← Dashboard
            </button>
          </Link>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-bold tracking-tight text-aura-ink">Question-by-question breakdown</h2>
      <div className="flex flex-col gap-4">
        {interview.questions.map((q, i) => (
          <QuestionCard key={q._id} question={q} index={i} />
        ))}
      </div>

      <div className="py-12 text-center">
        <Link to="/interview/new">
          <button type="button" className="btn-primary px-8 py-3 text-[15px]">
            Start Another Interview →
          </button>
        </Link>
      </div>
    </div>
  );
}
