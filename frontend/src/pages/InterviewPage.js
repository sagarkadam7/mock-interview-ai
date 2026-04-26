import React, { useState, useEffect, useId, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getInterview, submitAnswer } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { useConfirm } from "../context/ConfirmContext";
import CameraRecorder, { renderTranscriptWithFillerHighlights } from "../components/CameraRecorder";

const scoreColor = (s) => (s >= 7 ? "text-emerald-600" : s >= 4 ? "text-amber-600" : "text-rose-600");
const eyeColor = (p) => (p > 70 ? "text-emerald-600" : p > 40 ? "text-amber-600" : "text-rose-600");
const paceColor = (l) => (l === "good" ? "text-emerald-600" : "text-amber-600");

function MetricTile({ label, children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200/85 bg-gradient-to-b from-white/95 to-slate-50/80 p-3.5 shadow-sm ring-1 ring-white/60 backdrop-blur-sm dark:border-slate-600/50 dark:from-slate-800/90 dark:to-slate-900/70 dark:ring-slate-700/40 ${className}`}
    >
      <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="tabular-nums">{children}</div>
    </div>
  );
}

const COACH_CARDS = [
  { title: "Structure", k: "STAR", body: "Situation → task → action → result. Keep the arc tight and end on impact.", accent: "from-violet-500/12 to-transparent" },
  { title: "Presence", k: "Lens", body: "Look at the camera lens, not the preview. Steady gaze reads as confidence on video.", accent: "from-aura-coral/12 to-transparent" },
  { title: "Pace", k: "WPM", body: "Cut fillers (“um”, “like”). Aim for roughly 130–170 words per minute.", accent: "from-emerald-500/10 to-transparent" },
];

function SessionProgressRing({ answered, total }) {
  const uid = useId();
  const gradId = `session-ring-${uid.replace(/:/g, "")}`;
  const r = 28;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? answered / total : 0;
  const offset = c * (1 - pct);

  return (
    <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90" aria-hidden>
        <circle cx="38" cy="38" r={r} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="7" fill="none" />
        <circle
          cx="38"
          cy="38"
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out-expo"
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7E5F" />
            <stop offset="100%" stopColor="#9D50BB" />
          </linearGradient>
        </defs>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl font-semibold tabular-nums leading-none text-aura-ink">{answered}</span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">of {total}</span>
      </div>
    </div>
  );
}

function InterviewLoadingSkeleton() {
  return (
    <div className="page-shell relative max-w-7xl overflow-hidden py-12 md:py-14" aria-busy="true" aria-label="Loading interview">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)`,
            backgroundSize: "72px 100%",
          }}
        />
      </div>
      <div className="relative mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-8">
        <div className="skeleton-line h-9 w-24 rounded-full" />
        <div className="skeleton-line h-9 w-36 rounded-full" />
        <div className="w-full max-w-xl">
          <div className="skeleton-line mb-3 h-2 w-full rounded-full" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="skeleton-line h-8 w-8 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="relative flex flex-col gap-8 xl:flex-row xl:gap-10">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="skeleton-line h-36 w-full rounded-2xl md:h-40" />
          <div className="skeleton-line h-28 w-full rounded-2xl" />
          <div className="skeleton-line h-44 w-full rounded-2xl" />
        </div>
        <div className="w-full shrink-0 xl:w-[400px]">
          <div className="skeleton-line min-h-[320px] w-full rounded-2xl xl:min-h-[380px]" />
        </div>
      </div>
      <p className="relative mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Loading your session…</p>
    </div>
  );
}

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const cameraRecorderRef = useRef(null);
  const questionAnchorRef = useRef(null);
  const skipQuestionScrollOnce = useRef(true);

  useEffect(() => {
    skipQuestionScrollOnce.current = true;
    getInterview(id)
      .then(({ data }) => {
        const first = data.questions.findIndex((q) => q.score === null);
        setInterview(data);
        setCurrentIndex(first === -1 ? 0 : first);
      })
      .catch((err) => {
        const msg = getApiErrorMessage(err, "Failed to load interview.");
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!interview?.jobRole) return undefined;
    document.title = `${interview.jobRole} · Live session · InterviewAI`;
    return undefined;
  }, [interview?.jobRole]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!interview?.questions?.length) return;
    const q = interview.questions[currentIndex];
    if (!q) return;
    setError("");
    const snap = cameraRecorderRef.current?.finalizeRecording?.();
    const answerText = (snap?.text ?? transcript).trim();
    const mlPayload = snap?.mlPayload ?? mlData;

    if (!answerText) {
      toast.error(
        "Speak your answer while the mic is on so words appear in the transcript, then tap Submit. You do not need to press Stop first — Submit stops recording for you."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        questionId: q._id,
        answer: answerText,
        ...(mlPayload && typeof mlPayload === "object" ? mlPayload : {}),
      };
      const { data } = await submitAnswer(id, payload);
      setFeedback({ ...data, mlData });
      if (data.questions?.length) {
        setInterview((prev) => (prev ? { ...prev, questions: data.questions } : prev));
      }
    } catch {
      toast.error("Couldn’t get AI feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [interview, currentIndex, id, mlData, transcript]);

  useEffect(() => {
    if (!interview || loading || feedback) return;
    if (skipQuestionScrollOnce.current) {
      skipQuestionScrollOnce.current = false;
      return;
    }
    const el = questionAnchorRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentIndex, feedback, interview, loading]);

  useEffect(() => {
    if (!interview || loading || feedback) return;
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
      const t = e.target;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
      e.preventDefault();
      if (!submitting) handleSubmitAnswer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, handleSubmitAnswer, interview, loading, submitting]);

  useEffect(() => {
    if (!interview || interview.status === "completed") return undefined;
    const answered = interview.questions.filter((q) => q.score !== null).length;
    const onBeforeUnload = (e) => {
      const dirty =
        answered > 0 || Boolean(transcript.trim()) || Boolean(feedback) || submitting || isRecording;
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [interview, transcript, feedback, submitting, isRecording]);

  if (loading) {
    return <InterviewLoadingSkeleton />;
  }

  if (!interview) {
    return (
      <div className="page-shell relative max-w-2xl py-20 text-center md:py-28">
        <div className="alert-error mb-8 text-left" role="alert">
          <span className="font-mono text-xs font-bold text-rose-700" aria-hidden>
            !
          </span>
          <span>{error || "Interview not found or you no longer have access."}</span>
        </div>
        <button type="button" className="btn-cta px-8 py-3" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const questions = interview.questions;
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const primaryQuestions = questions.filter((q) => (q.questionType || "primary") === "primary");
  const primaryAnswered = primaryQuestions.filter((q) => q.score !== null).length;
  const answeredCount = questions.filter((q) => q.score !== null).length;
  const progress = totalQ > 0 ? (answeredCount / totalQ) * 100 : 0;
  const isLastQ = currentIndex === totalQ - 1;

  const parentQ =
    currentQ?.questionType === "follow_up" && currentQ.parentQuestionId
      ? questions.find((q) => String(q._id) === String(currentQ.parentQuestionId))
      : null;

  const settingsLabel = [
    interview.level ? String(interview.level).toUpperCase() : null,
    interview.interviewMode ? String(interview.interviewMode).replace(/_/g, " ").toUpperCase() : null,
    interview.persona ? String(interview.persona).replace(/_/g, " ").toUpperCase() : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const canSubmitAnswer = Boolean(transcript.trim()) || isRecording;

  const handleNext = () => {
    if (isLastQ) navigate(`/interview/${id}/report`);
    else {
      setFeedback(null);
      setTranscript("");
      setMlData(null);
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleSkip = async () => {
    const ok = await confirm(
      "Your answer will be submitted as blank and scored. You won’t be able to re-record for this question.",
      {
        title: "Skip this question?",
        confirmLabel: "Skip",
        cancelLabel: "Keep answering",
      }
    );
    if (!ok) return;
    setSubmitting(true);
    try {
      const { data } = await submitAnswer(id, { questionId: currentQ._id, answer: "" });
      if (data.questions?.length) {
        setInterview((prev) => (prev ? { ...prev, questions: data.questions } : prev));
      }
      if (isLastQ) navigate(`/interview/${id}/report`);
      else {
        setFeedback(null);
        setTranscript("");
        setMlData(null);
        setCurrentIndex((i) => i + 1);
      }
    } catch {
      toast.error("Couldn’t skip this question. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-7xl overflow-x-hidden px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(55vh,480px)]"
        style={{
          background: `radial-gradient(ellipse 90% 75% at 50% -15%, rgba(255,126,95,0.11) 0%, transparent 58%),
            radial-gradient(ellipse 55% 45% at 100% 5%, rgba(157,80,187,0.09) 0%, transparent 48%),
            radial-gradient(ellipse 45% 40% at 0% 25%, rgba(157,80,187,0.05) 0%, transparent 45%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white/95 via-white to-slate-50/80 p-6 shadow-lux-lg ring-1 ring-white/90 dark:border-slate-700/80 dark:from-slate-900/95 dark:via-slate-950 dark:to-slate-900/80 dark:shadow-none dark:ring-slate-800/50 md:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-aura-coral/20 to-aura-violet/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <button type="button" className="btn-outline shrink-0 py-2.5 text-xs font-semibold" onClick={() => navigate("/dashboard")}>
              ← Exit
            </button>
            <div className="hidden h-10 w-px shrink-0 bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Active session</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex max-w-full items-center truncate rounded-full border border-slate-200/90 bg-white/95 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-aura-ink shadow-sm ring-1 ring-white/80 dark:border-slate-600/80 dark:bg-slate-800/90 dark:text-slate-100 dark:ring-slate-700/50">
                  {interview.jobRole}
                </span>
                {settingsLabel && (
                  <span className="inline-flex max-w-full items-center truncate rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 ring-1 ring-white/70 dark:border-slate-600/70 dark:bg-slate-900/50 dark:text-slate-300 dark:ring-slate-800/40">
                    {settingsLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 lg:justify-end">
            <div className="text-left sm:text-right">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Progress</p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="text-2xl font-bold tabular-nums text-aura-ink dark:text-slate-100">{primaryAnswered}</span>
                <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
                <span className="font-semibold tabular-nums text-slate-600 dark:text-slate-300">{primaryQuestions.length}</span>
                <span className="ml-2 text-slate-400 dark:text-slate-500">primary</span>
              </p>
            </div>
            <SessionProgressRing answered={primaryAnswered} total={primaryQuestions.length || 1} />
          </div>
        </div>

        <div className="relative mt-8">
          <div className="progress-track h-2.5 overflow-hidden rounded-full shadow-inner ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aura-coral to-aura-violet transition-[width] duration-700 ease-out-expo"
              style={{ width: `${progress}%`, boxShadow: "0 0 20px rgba(157, 80, 187, 0.25)" }}
            />
          </div>
        </div>

        <div
          className="mt-5 flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-1 dark:border-slate-700/80 dark:bg-slate-800/50"
          role="list"
          aria-label="Question progress"
        >
          {questions.map((q, i) => (
            <div
              key={q._id}
              role="listitem"
              title={q.score !== null ? `Scored ${q.score}/10` : i === currentIndex ? "Current question" : "Upcoming"}
              className={`flex min-h-[2.5rem] min-w-0 flex-1 items-center justify-center rounded-xl text-[11px] font-bold tabular-nums transition-all duration-300 sm:text-xs ${
                q.score !== null
                  ? q.score >= 7
                    ? "border border-emerald-300/50 bg-emerald-50/95 text-emerald-900 shadow-sm dark:border-emerald-500/25 dark:bg-emerald-950/50 dark:text-emerald-100"
                    : q.score >= 4
                      ? "border border-amber-300/50 bg-amber-50/95 text-amber-950 shadow-sm dark:border-amber-500/25 dark:bg-amber-950/45 dark:text-amber-100"
                      : "border border-rose-300/50 bg-rose-50/95 text-rose-900 shadow-sm dark:border-rose-500/25 dark:bg-rose-950/45 dark:text-rose-100"
                  : i === currentIndex
                    ? "border border-aura-violet/35 bg-white text-aura-ink shadow-[0_0_0_2px_rgba(157,80,187,0.15),0_10px_28px_-12px_rgba(15,23,42,0.15)] dark:bg-slate-900 dark:text-white dark:shadow-[0_0_0_2px_rgba(157,80,187,0.25),0_10px_28px_-12px_rgba(0,0,0,0.4)]"
                    : "border border-transparent text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="px-0.5">{i + 1}</span>
            </div>
          ))}
        </div>
      </header>

      {error && (
        <div className="alert-error relative z-10 mb-6" role="alert">
          <span className="font-mono text-xs font-bold text-rose-700" aria-hidden>
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-12">
        <div className="min-w-0 flex-1 space-y-6">
          <div
            ref={questionAnchorRef}
            className="relative rounded-[1.35rem] bg-gradient-to-br from-aura-coral/70 via-white/40 to-aura-violet/70 p-[1px] shadow-[0_28px_64px_-24px_rgba(15,23,42,0.18)] dark:from-aura-coral/35 dark:via-slate-700/25 dark:to-aura-violet/45 dark:shadow-[0_32px_70px_-24px_rgba(0,0,0,0.55)]"
          >
            <div className="relative overflow-hidden rounded-[1.3rem] bg-white/95 p-6 shadow-lux-lg dark:bg-slate-950/95 md:p-8">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-aura-coral/18 to-aura-violet/12 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Question {String(currentIndex + 1).padStart(2, "0")} — {String(totalQ).padStart(2, "0")}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {currentQ.questionType === "follow_up" && (
                      <span className="rounded-full border border-aura-violet/30 bg-aura-violet/[0.1] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-aura-violet dark:border-aura-violet/35 dark:bg-aura-violet/15">
                        Adaptive follow-up
                      </span>
                    )}
                    {parentQ && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-white/70 dark:border-slate-600/70 dark:bg-slate-900/45 dark:text-slate-300 dark:ring-slate-800/40">
                        On: {String(parentQ.text || "").slice(0, 42)}
                        {String(parentQ.text || "").length > 42 ? "…" : ""}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-white/80 dark:border-slate-600/80 dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700/50">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/45 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Live session
                    </span>
                  </div>
                </div>
                <p className="font-display text-xl font-medium leading-[1.45] tracking-tight text-aura-ink md:text-2xl md:leading-[1.5]">{currentQ.text}</p>
              </div>
            </div>
          </div>

          {!feedback && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="section-eyebrow">Coaching brief</span>
                <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" aria-hidden />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {COACH_CARDS.map((c) => (
                  <div
                    key={c.title}
                    className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b ${c.accent} to-white/90 p-5 shadow-sm ring-1 ring-white/70 dark:border-slate-700/80 dark:to-slate-900/85 dark:ring-slate-800/40`}
                  >
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{c.k}</p>
                    <h3 className="mt-1.5 text-sm font-bold tracking-tight text-aura-ink">{c.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback && (
            <div className="glass-panel-lg animate-page-in relative overflow-hidden border-slate-200/90 p-6 shadow-lux md:p-8">
              <div
                className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-aura-violet/12 to-transparent blur-3xl"
                aria-hidden
              />
              <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5 dark:border-slate-700/70">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Model feedback</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-aura-ink md:text-2xl">Answer score</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-display text-4xl font-semibold tabular-nums md:text-5xl ${scoreColor(feedback.score)}`}>{feedback.score}</span>
                  <span className="text-base font-medium text-slate-400 dark:text-slate-500">/10</span>
                </div>
              </div>
              <div className="progress-track mb-6 h-2 shadow-inner ring-1 ring-slate-900/[0.03]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aura-coral to-aura-violet transition-all duration-500"
                  style={{ width: `${feedback.score * 10}%`, boxShadow: "0 0 16px rgba(157, 80, 187, 0.28)" }}
                />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-[15px]">{feedback.feedback}</p>

              {feedback.followUpInserted && (
                <div className="mb-6 rounded-2xl border border-aura-violet/20 bg-gradient-to-br from-aura-violet/[0.07] to-white/90 p-4 ring-1 ring-aura-violet/10 dark:to-slate-900/90">
                  <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-aura-violet">Adaptive interviewer</div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Based on your answer, the session added a targeted follow-up question next. Continue to drill deeper, then move on when you are ready.
                  </p>
                </div>
              )}

              {feedback.mlData && (
                <div className="mb-6">
                  <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Signal breakdown</p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                    {feedback.mlData.eyeContactPct !== null && (
                      <MetricTile label="Eye contact">
                        <div className={`text-lg font-bold ${eyeColor(feedback.mlData.eyeContactPct)}`}>{feedback.mlData.eyeContactPct}%</div>
                      </MetricTile>
                    )}
                    {feedback.mlData.wordsPerMinute > 0 && (
                      <MetricTile label="Pace">
                        <div className={`text-base font-bold ${paceColor(feedback.mlData.paceLabel)}`}>
                          {feedback.mlData.wordsPerMinute}{" "}
                          <span className="text-xs font-semibold normal-case text-slate-500 dark:text-slate-400">wpm</span>
                          <span className="mt-0.5 block text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400">{feedback.mlData.paceLabel}</span>
                        </div>
                      </MetricTile>
                    )}
                    {feedback.mlData.fillerWordCount !== null && (
                      <MetricTile label="Fillers">
                        <div
                          className={`text-lg font-bold ${
                            feedback.mlData.fillerWordCount > 5
                              ? "text-rose-600"
                              : feedback.mlData.fillerWordCount > 2
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }`}
                        >
                          {feedback.mlData.fillerWordCount}
                        </div>
                      </MetricTile>
                    )}
                    {feedback.mlData.dominantEmotion && (
                      <MetricTile label="Tone">
                        <div className="text-base font-semibold capitalize text-aura-ink">{feedback.mlData.dominantEmotion}</div>
                      </MetricTile>
                    )}
                    {feedback.mlData.confidenceScore !== null && (
                      <MetricTile label="Confidence (ML)" className="col-span-2 border-aura-violet/25 bg-gradient-to-br from-aura-violet/[0.07] to-white/90 dark:to-slate-900/90">
                        <div className="text-2xl font-bold text-aura-ink">{feedback.mlData.confidenceScore}/10</div>
                      </MetricTile>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6 flex flex-col gap-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 ring-1 ring-emerald-500/10">
                  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Strengths</div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{feedback.strengths}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 ring-1 ring-amber-500/10">
                  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800">Improvements</div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{feedback.improvements}</p>
                </div>
              </div>

              <button type="button" className="btn-cta w-full justify-center py-3.5 text-[15px]" onClick={handleNext}>
                {isLastQ ? "View full report" : `Next question (${currentIndex + 2}/${totalQ})`}
                <span aria-hidden>→</span>
              </button>
            </div>
          )}

          {!feedback && (
            <div className="glass-panel-lg rounded-2xl border-slate-200/90 p-5 md:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="label-field mb-0" htmlFor="session-transcript-panel">
                  Live transcript
                </label>
                <span className="rounded-full bg-slate-100/90 px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/90 dark:text-slate-400">
                  Speech-to-text
                </span>
              </div>
              <div
                id="session-transcript-panel"
                className="max-h-48 min-h-[120px] overflow-y-auto rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/95 to-white/80 p-4 font-mono text-[13px] leading-relaxed text-slate-700 shadow-inner ring-1 ring-white/60 dark:border-slate-600/80 dark:from-slate-900/80 dark:to-slate-950/60 dark:text-slate-200 dark:ring-slate-800/50 md:max-h-64"
              >
                {transcript ? (
                  <div className="italic text-slate-800 dark:text-slate-100">{renderTranscriptWithFillerHighlights(transcript)}</div>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    <span className="font-semibold not-italic text-slate-500 dark:text-slate-400">Waiting for audio.</span> Hit{" "}
                    <span className="rounded border border-slate-200/80 bg-white px-1.5 py-0.5 text-[11px] font-bold not-italic text-aura-ink dark:border-slate-600 dark:bg-slate-800">
                      Start recording
                    </span>{" "}
                    — words stream here in real time.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-24 xl:w-[420px] xl:self-start">
          {!feedback && (
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-sm leading-snug text-slate-600 shadow-sm ring-1 ring-white/80 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800/50">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">How this works</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[13px]">
                <li className={isRecording ? "font-semibold text-aura-ink dark:text-white" : ""}>Start recording and answer out loud.</li>
                <li>Watch your transcript and live metrics.</li>
                <li>
                  Tap <span className="font-semibold">Submit answer</span> when you are done — we stop the mic for you and send everything in one step.
                </li>
              </ol>
              <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Shortcut: <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800">Ctrl</kbd>{" "}
                + <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800">Enter</kbd>{" "}
                ( <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800">⌘</kbd>{" "}
                + <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800">Enter</kbd> on Mac ) to submit.
              </p>
            </div>
          )}

          <div className="relative rounded-[1.25rem] bg-gradient-to-br from-aura-coral/50 via-white/30 to-aura-violet/50 p-[1px] shadow-lux-lg dark:from-aura-coral/25 dark:via-slate-800/30 dark:to-aura-violet/35">
            <div className="overflow-hidden rounded-[1.2rem] border border-slate-200/80 bg-white/95 shadow-inner ring-1 ring-white/90 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/90 dark:ring-slate-800/50">
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50/95 via-white to-slate-50/95 px-4 py-3 text-center dark:border-slate-700/80 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/90">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Camera & coaching</p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Presence metrics update while you speak</p>
              </div>
              <div className="p-3 sm:p-4">
                <CameraRecorder
                  ref={cameraRecorderRef}
                  key={currentIndex}
                  onTranscriptChange={setTranscript}
                  onRecordingChange={setIsRecording}
                  onMLData={setMlData}
                  disabled={!!feedback}
                  showTranscript={false}
                  metricsLayout="below"
                />
              </div>
            </div>
          </div>

          {!feedback && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="group relative w-full overflow-hidden rounded-full py-4 text-[15px] font-bold tracking-tight text-white shadow-[0_16px_40px_-10px_rgba(15,23,42,0.45)] transition-transform duration-250 ease-out-expo enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-100 disabled:shadow-none dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)]"
                onClick={handleSubmitAnswer}
                disabled={submitting || !canSubmitAnswer}
                aria-busy={submitting}
              >
                <span className="absolute inset-0 bg-aura-ink dark:bg-slate-100 group-disabled:bg-slate-700 dark:group-disabled:bg-slate-200" />
                <span className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-slate-900/20" />
                <span className="relative flex items-center justify-center gap-2 dark:text-aura-ink group-disabled:text-slate-200 dark:group-disabled:text-slate-900">
                  {submitting ? (
                    <>
                      <span
                        className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white dark:border-slate-400/30 dark:border-t-slate-900"
                        aria-hidden
                      />
                      Scoring answer…
                    </>
                  ) : (
                    <>
                      Submit answer
                      <span aria-hidden className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </span>
              </button>
              <p className="text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {canSubmitAnswer
                  ? "Submit locks in this take and runs the scorer. Stop recording first only if you want to review metrics on screen."
                  : "Start recording and speak — Submit unlocks once the mic is on or text appears in your transcript."}
              </p>
              <button
                type="button"
                className="w-full rounded-full border border-slate-200/90 bg-white/80 py-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-aura-ink disabled:cursor-not-allowed disabled:opacity-100 disabled:border-slate-200/70 disabled:bg-slate-100/70 disabled:text-slate-400 dark:border-slate-600/80 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800/80 dark:hover:text-white dark:disabled:border-slate-700/80 dark:disabled:bg-slate-900/35 dark:disabled:text-slate-500"
                onClick={handleSkip}
                disabled={submitting}
              >
                Skip this question
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
