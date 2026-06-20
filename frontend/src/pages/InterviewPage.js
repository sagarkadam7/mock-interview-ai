import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getInterview, submitAnswer, patchInterviewMeta } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";
import { useConfirm } from "../context/ConfirmContext";
import CameraRecorder, { renderTranscriptWithFillerHighlights } from "../components/CameraRecorder";
import InterviewKeyboardHelp from "../components/InterviewKeyboardHelp";
import PrepBriefPanel from "../components/PrepBriefPanel";

const scoreColor = (s) => (s >= 7 ? "text-emerald-600" : s >= 4 ? "text-amber-600" : "text-rose-600");
const eyeColor = (p) => (p > 70 ? "text-emerald-600" : p > 40 ? "text-amber-600" : "text-rose-600");
const paceColor = (l) => (l === "good" ? "text-emerald-600" : "text-amber-600");

function MetricTile({ label, children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200/85 bg-gradient-to-b from-white/95 to-slate-50/80 p-3.5 shadow-sm ring-1 ring-white/60 backdrop-blur-sm dark:border-slate-600/50 dark:from-slate-800/90 dark:to-slate-900/70 dark:ring-slate-700/40 ${className}`}
    >
      <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="tabular-nums">{children}</div>
    </div>
  );
}

const COACH_CARDS = [
  {
    title: "Structure",
    k: "STAR",
    body: "Situation → task → action → result. Keep the arc tight and end on impact.",
    accent: "from-violet-500/12 to-transparent",
  },
  {
    title: "Presence",
    k: "Lens",
    body: "Look at the camera lens, not the preview. Steady gaze reads as confidence on video.",
    accent: "from-aura-coral/12 to-transparent",
  },
  {
    title: "Pace",
    k: "WPM",
    body: "Cut fillers (“um”, “like”). Aim for roughly 130–170 words per minute.",
    accent: "from-emerald-500/10 to-transparent",
  },
];

function InterviewLoadingSkeleton() {
  return (
    <div
      className="page-shell relative max-w-7xl overflow-hidden py-12 md:py-14"
      aria-busy="true"
      aria-label="Loading interview"
    >
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
      <p className="relative mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading your session…
      </p>
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
  const [prepNotesOpen, setPrepNotesOpen] = useState(false);
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const [prepNotes, setPrepNotes] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const prepNotesSyncedRef = useRef("");
  const cameraRecorderRef = useRef(null);
  const questionAnchorRef = useRef(null);
  const transcriptPanelRef = useRef(null);
  const skipQuestionScrollOnce = useRef(true);

  const loadInterview = useCallback(() => {
    skipQuestionScrollOnce.current = true;
    setLoading(true);
    setError("");
    getInterview(id)
      .then(({ data }) => {
        const first = data.questions.findIndex((q) => q.score === null);
        setInterview(data);
        setCurrentIndex(first === -1 ? 0 : first);
      })
      .catch((err) => {
        const msg = getApiErrorMessage(err, "Failed to load interview.");
        setInterview(null);
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  useEffect(() => {
    if (!interview?.jobRole) return undefined;
    document.title = `${interview.jobRole} · Live session · InterviewAI`;
    return undefined;
  }, [interview?.jobRole]);

  useEffect(() => {
    if (!interview?._id) return;
    setPrepNotes(interview.candidateNotes || "");
    prepNotesSyncedRef.current = interview.candidateNotes || "";
  }, [interview?._id]);

  useEffect(() => {
    const onKey = (e) => {
      if (helpOpen) return;
      if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      setHelpOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen]);

  useEffect(() => {
    if (!interview?._id || loading) return undefined;
    if (prepNotes === prepNotesSyncedRef.current) return undefined;
    const t = setTimeout(async () => {
      try {
        await patchInterviewMeta(id, { candidateNotes: prepNotes });
        prepNotesSyncedRef.current = prepNotes;
        setInterview((prev) => (prev ? { ...prev, candidateNotes: prepNotes } : prev));
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Couldn’t save prep notes."));
      }
    }, 900);
    return () => clearTimeout(t);
  }, [prepNotes, id, interview?._id, loading]);

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
        setInterview((prev) =>
          prev
            ? {
                ...prev,
                questions: data.questions,
                status: data.interviewStatus ?? prev.status,
                firstAnsweredAt: data.firstAnsweredAt ?? prev.firstAnsweredAt,
                completedAt: data.completedAt ?? prev.completedAt,
              }
            : prev
        );
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
    if (!transcript.trim() || !transcriptPanelRef.current) return;
    transcriptPanelRef.current.scrollTop = transcriptPanelRef.current.scrollHeight;
  }, [transcript]);

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
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn-cta px-8 py-3" onClick={loadInterview}>
            Retry
          </button>
          <button type="button" className="btn-outline px-8 py-3" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = interview.questions;
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  if (!currentQ && !feedback) {
    return (
      <div className="page-shell relative max-w-2xl py-20 text-center md:py-28">
        <div className="alert-error mb-8 text-left" role="alert">
          <span className="font-mono text-xs font-bold text-rose-700" aria-hidden>
            !
          </span>
          <span>No questions found for this session.</span>
        </div>
        <button type="button" className="btn-outline px-8 py-3" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

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
  const submitEnabled = canSubmitAnswer && !submitting;
  const submitBtnClass = submitEnabled
    ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 text-white shadow-[0_8px_28px_-6px_rgba(91,33,182,0.6)] hover:brightness-110 active:scale-[0.98]"
    : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400";

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
      "This will submit a blank answer and score it as-is. You won’t be able to re-record for this question.",
      {
        title: "Skip this question?",
        variant: "danger",
        confirmLabel: "Skip",
        cancelLabel: "Keep answering",
      }
    );
    if (!ok) return;
    setSubmitting(true);
    try {
      const { data } = await submitAnswer(id, { questionId: currentQ._id, answer: "" });
      if (data.questions?.length) {
        setInterview((prev) =>
          prev
            ? {
                ...prev,
                questions: data.questions,
                status: data.interviewStatus ?? prev.status,
                firstAnsweredAt: data.firstAnsweredAt ?? prev.firstAnsweredAt,
                completedAt: data.completedAt ?? prev.completedAt,
              }
            : prev
        );
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
    <div
      className={`relative mx-auto min-h-screen w-full max-w-7xl overflow-x-hidden px-4 sm:px-8 md:px-10 ${!feedback ? "pb-28 lg:pb-10" : "pb-10"} pt-4 sm:pt-6`}
    >
      <InterviewKeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <button
        type="button"
        className={`fixed right-4 z-[90] flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-sm font-bold text-slate-600 shadow-md backdrop-blur-md transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:text-violet-300 sm:right-8 ${!feedback ? "bottom-[5.5rem] lg:bottom-8" : "bottom-8"}`}
        onClick={() => setHelpOpen(true)}
        aria-label="Keyboard shortcuts"
        title="Shortcuts (?)"
      >
        ?
      </button>

      {/* Compact session bar — stays visible while answering */}
      <header className="sticky top-16 z-40 -mx-4 mb-4 border-b border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/95 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:mb-5 lg:rounded-2xl lg:border lg:shadow-none">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="btn-outline shrink-0 px-3 py-2 text-xs font-semibold"
            onClick={() => navigate("/dashboard")}
          >
            ← Exit
          </button>
          <div className="hidden h-8 w-px shrink-0 bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold text-aura-ink dark:text-slate-100">{interview.jobRole}</p>
              {interview.targetCompany ? (
                <span className="hidden truncate text-xs font-medium text-violet-600 dark:text-violet-300 sm:inline">
                  · {interview.targetCompany}
                </span>
              ) : null}
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 sm:ml-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-slate-500 dark:text-slate-400">
                Q{currentIndex + 1}/{totalQ}
              </span>
              <div className="progress-track h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aura-coral to-aura-violet transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                {answeredCount}/{totalQ}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/90 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => setSessionDetailsOpen((o) => !o)}
            aria-expanded={sessionDetailsOpen}
            aria-label="Session details"
            title="Session details"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {sessionDetailsOpen ? (
          <div className="mt-3 space-y-3 border-t border-slate-200/80 pt-3 dark:border-slate-700/80">
            {settingsLabel ? (
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {settingsLabel}
              </p>
            ) : null}
            <div
              className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-100/60 p-1 dark:border-slate-700/80 dark:bg-slate-800/50"
              role="list"
              aria-label="Question progress"
            >
              {questions.map((q, i) => (
                <div
                  key={q._id}
                  role="listitem"
                  title={
                    q.score !== null
                      ? `Scored ${q.score}/10`
                      : i === currentIndex
                        ? "Current question"
                        : "Upcoming"
                  }
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums ${
                    q.score !== null
                      ? q.score >= 7
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : q.score >= 4
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-100"
                      : i === currentIndex
                        ? "bg-white text-aura-ink shadow-sm ring-2 ring-aura-violet/30 dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-violet-200/60 bg-violet-50/30 dark:border-violet-500/20 dark:bg-violet-950/20">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-aura-ink dark:text-slate-100"
                onClick={() => setPrepNotesOpen((o) => !o)}
                aria-expanded={prepNotesOpen}
              >
                <span>Private prep notes{prepNotes.trim() ? " · saved" : ""}</span>
                <span className="text-slate-400" aria-hidden>
                  {prepNotesOpen ? "▲" : "▼"}
                </span>
              </button>
              {prepNotesOpen ? (
                <div className="border-t border-violet-200/50 px-3 pb-3 dark:border-violet-800/40">
                  <textarea
                    className="input-field mt-2 min-h-[72px] resize-y text-sm"
                    value={prepNotes}
                    onChange={(e) => setPrepNotes(e.target.value.slice(0, 8000))}
                    placeholder="Jot reminders between questions…"
                    maxLength={8000}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      {error && (
        <div className="alert-error relative z-10 mb-6" role="alert">
          <span className="font-mono text-xs font-bold text-rose-700" aria-hidden>
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,360px)] lg:items-start lg:gap-6">
        {/* Unified workspace: question + live transcript (splits on mobile for camera between) */}
        {!feedback ? (
          <div
            ref={questionAnchorRef}
            className={`order-1 contents lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:block lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200/90 lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-slate-900/[0.03] dark:lg:border-slate-700/80 dark:lg:bg-slate-950 dark:lg:ring-white/[0.04] ${isRecording ? "interview-workspace-recording" : ""}`}
          >
            <div className="interview-workspace-question mb-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-5 py-5 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-700/80 dark:bg-slate-950 dark:ring-white/[0.04] sm:px-6 sm:py-6 lg:mb-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none lg:ring-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white dark:bg-slate-100 dark:text-slate-900">
                  Q{currentIndex + 1} / {totalQ}
                </span>
                {currentQ.questionType === "follow_up" && (
                  <span className="rounded-full border border-violet-200/80 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/50 dark:text-violet-300">
                    Follow-up
                  </span>
                )}
                {isRecording && (
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/70 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </span>
                    Recording
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold leading-snug tracking-tight text-aura-ink sm:text-xl sm:leading-relaxed md:text-[1.35rem]">
                {currentQ.text}
              </h2>
              {parentQ ? (
                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <span className="mt-0.5 shrink-0 text-violet-500" aria-hidden>
                    ↳
                  </span>
                  <span>
                    Follow-up to{" "}
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {String(parentQ.text || "").slice(0, 96)}
                      {String(parentQ.text || "").length > 96 ? "…" : ""}
                    </span>
                  </span>
                </p>
              ) : null}
            </div>

            <div className="interview-workspace-transcript order-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-700/80 dark:bg-slate-950 dark:ring-white/[0.04] lg:order-none lg:rounded-none lg:border-0 lg:border-t lg:border-slate-200/80 lg:bg-transparent lg:shadow-none lg:ring-0 dark:lg:border-slate-800/80">
              <div className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Live transcript
                  </span>
                  {isRecording && (
                    <span className="hidden text-[10px] text-slate-400 sm:inline dark:text-slate-500">
                      · updates as you speak
                    </span>
                  )}
                </div>
                {transcript.trim() ? (
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-violet-700 dark:text-violet-300">
                    {transcript.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                ) : null}
              </div>
              <div className="px-5 pb-4 sm:px-6 sm:pb-5">
                <div
                  id="session-transcript-panel"
                  ref={transcriptPanelRef}
                  className="interview-transcript-panel max-h-[min(40vh,280px)] min-h-[120px] overflow-y-auto rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 text-[15px] leading-[1.65] text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 sm:min-h-[140px] lg:max-h-[min(48vh,360px)]"
                >
                  {transcript ? (
                    <div className="text-slate-800 dark:text-slate-100">
                      {renderTranscriptWithFillerHighlights(transcript)}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isRecording
                        ? "Start speaking — your answer will appear here in real time."
                        : "Hit Start recording on the right, then answer out loud."}{" "}
                      <kbd className="ml-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Ctrl+Enter
                      </kbd>{" "}
                      to submit.
                    </p>
                  )}
                </div>
              </div>

              {!isRecording && (
                <details className="group border-t border-slate-200/80 dark:border-slate-800/80">
                  <summary className="cursor-pointer list-none px-5 py-3 text-xs font-semibold text-slate-500 transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-200 sm:px-6 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-slate-400 transition-transform group-open:rotate-90" aria-hidden>
                        ▸
                      </span>
                      Coaching tips
                    </span>
                  </summary>
                  <div className="grid gap-2 border-t border-slate-200/80 px-5 pb-4 pt-3 dark:border-slate-800/80 sm:grid-cols-3 sm:px-6 sm:pb-5">
                    {COACH_CARDS.map((c) => (
                      <div
                        key={c.title}
                        className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/35"
                      >
                        <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">{c.k}</p>
                        <p className="mt-1 text-xs font-semibold text-aura-ink dark:text-slate-100">{c.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{c.body}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ) : null}

        {/* Presence panel — camera + signals + actions */}
        {!feedback && (
        <aside className="order-2 min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-[4.5rem] lg:self-start">
          <div className="interview-presence-panel overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                Presence
              </p>
              {!isRecording ? (
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Camera + mic</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              )}
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
                metricsLayout="bar"
              />
            </div>

            <div className="hidden border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800 lg:block">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`flex-[2] rounded-xl py-3 text-sm font-bold tracking-tight transition-all ${submitBtnClass}`}
                  onClick={handleSubmitAnswer}
                  disabled={!submitEnabled}
                  aria-busy={submitting}
                >
                  {submitting ? "Scoring…" : "Submit answer →"}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200/90 py-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600/80 dark:text-slate-300 dark:hover:bg-slate-800/80"
                  onClick={handleSkip}
                  disabled={submitting}
                >
                  Skip
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
                {canSubmitAnswer ? "Ctrl+Enter submits · mic stops automatically" : "Record to unlock submit"}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <PrepBriefPanel
              interviewId={id}
              prepBrief={interview.prepBrief}
              onBriefUpdate={(prepBrief) => setInterview((prev) => (prev ? { ...prev, prepBrief } : prev))}
              defaultOpen={false}
            />
          </div>
        </aside>
        )}

        {/* Feedback */}
        {feedback && (
        <div className="order-3 min-w-0 space-y-4 lg:col-span-2">
            <div
              ref={questionAnchorRef}
              className="glass-panel-lg animate-page-in relative overflow-hidden rounded-2xl border border-slate-200/90 p-5 shadow-sm dark:border-slate-700/80 sm:p-6 md:p-8"
            >
              <div
                className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-aura-violet/12 to-transparent blur-3xl"
                aria-hidden
              />
              <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5 dark:border-slate-700/70">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Model feedback
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-aura-ink md:text-2xl">
                    Answer score
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-display text-4xl font-semibold tabular-nums md:text-5xl ${scoreColor(feedback.score)}`}
                  >
                    {feedback.score}
                  </span>
                  <span className="text-base font-medium text-slate-400 dark:text-slate-500">/10</span>
                </div>
              </div>
              <div className="progress-track mb-6 h-2 shadow-inner ring-1 ring-slate-900/[0.03]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aura-coral to-aura-violet transition-all duration-500"
                  style={{ width: `${feedback.score * 10}%`, boxShadow: "0 0 16px rgba(91,33,182, 0.28)" }}
                />
              </div>
              {feedback.aiFallback ? (
                <div className="mb-6 rounded-2xl border border-amber-300/50 bg-amber-50/80 p-4 text-amber-950 ring-1 ring-amber-200/70 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-50 dark:ring-amber-500/20">
                  <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
                    Fallback coaching mode
                  </div>
                  <p className="text-sm leading-relaxed opacity-[0.92]">
                    The AI response was temporarily unreliable, so we generated safe default coaching. You can
                    tap Submit again to retry.
                  </p>
                </div>
              ) : null}
              <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-[15px]">
                {feedback.feedback}
              </p>

              {feedback.followUpInserted && (
                <div className="mb-6 rounded-2xl border border-aura-violet/20 bg-gradient-to-br from-aura-violet/[0.07] to-white/90 p-4 ring-1 ring-aura-violet/10 dark:to-slate-900/90">
                  <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-aura-violet">
                    Adaptive interviewer
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Based on your answer, the session added a targeted follow-up question next. Continue to
                    drill deeper, then move on when you are ready.
                  </p>
                  {feedback.followUpQuestion?.text ? (
                    <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-left shadow-sm ring-1 ring-white/60 dark:border-slate-700/80 dark:bg-slate-950/40 dark:ring-slate-800/40">
                      <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                        Next question (preview)
                      </div>
                      <p className="text-sm font-semibold leading-relaxed text-aura-ink dark:text-slate-100">
                        {feedback.followUpQuestion.text}
                      </p>
                      {feedback.followUpQuestion.hint ? (
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">Hint:</span> {feedback.followUpQuestion.hint}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}

              {feedback.mlData && (
                <div className="mb-6">
                  <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Signal breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                    {feedback.mlData.eyeContactPct !== null && (
                      <MetricTile label="Eye contact">
                        <div className={`text-lg font-bold ${eyeColor(feedback.mlData.eyeContactPct)}`}>
                          {feedback.mlData.eyeContactPct}%
                        </div>
                      </MetricTile>
                    )}
                    {feedback.mlData.wordsPerMinute > 0 && (
                      <MetricTile label="Pace">
                        <div className={`text-base font-bold ${paceColor(feedback.mlData.paceLabel)}`}>
                          {feedback.mlData.wordsPerMinute}{" "}
                          <span className="text-xs font-semibold normal-case text-slate-500 dark:text-slate-400">
                            wpm
                          </span>
                          <span className="mt-0.5 block text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400">
                            {feedback.mlData.paceLabel}
                          </span>
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
                        <div className="text-base font-semibold capitalize text-aura-ink">
                          {feedback.mlData.dominantEmotion}
                        </div>
                      </MetricTile>
                    )}
                    {feedback.mlData.confidenceScore !== null && (
                      <MetricTile
                        label="Confidence (ML)"
                        className="col-span-2 border-aura-violet/25 bg-gradient-to-br from-aura-violet/[0.07] to-white/90 dark:to-slate-900/90"
                      >
                        <div className="text-2xl font-bold text-aura-ink">
                          {feedback.mlData.confidenceScore}/10
                        </div>
                      </MetricTile>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6 flex flex-col gap-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 ring-1 ring-emerald-500/10">
                  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Strengths
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {feedback.strengths}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 ring-1 ring-amber-500/10">
                  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800">
                    Improvements
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {feedback.improvements}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-cta w-full justify-center py-3.5 text-[15px]"
                onClick={handleNext}
              >
                {isLastQ ? "View full report" : `Next question (${currentIndex + 2}/${totalQ})`}
                <span aria-hidden>→</span>
              </button>
            </div>
        </div>
        )}
      </div>

      {!feedback && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 p-3 shadow-[0_-8px_32px_-8px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/95 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-200/90 py-3 text-sm font-semibold text-slate-700 dark:border-slate-600/80 dark:text-slate-200"
              onClick={handleSkip}
              disabled={submitting}
            >
              Skip
            </button>
            <button
              type="button"
              className={`flex-[2] rounded-xl py-3 text-sm font-bold transition-all ${submitBtnClass}`}
              onClick={handleSubmitAnswer}
              disabled={!submitEnabled}
              aria-busy={submitting}
            >
              {submitting ? "Scoring…" : canSubmitAnswer ? "Submit answer →" : "Record to submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
