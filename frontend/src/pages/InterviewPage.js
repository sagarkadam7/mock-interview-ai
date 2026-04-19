import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getInterview, submitAnswer } from "../utils/api";
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
  const [recordingDone, setRecordingDone] = useState(false);

  useEffect(() => {
    getInterview(id)
      .then(({ data }) => {
        const first = data.questions.findIndex((q) => q.score === null);
        setInterview(data);
        setCurrentIndex(first === -1 ? 0 : first);
      })
      .catch(() => setError("Failed to load interview."))
      .finally(() => setLoading(false));
  }, [id]);

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
  const answeredCount = questions.filter((q) => q.score !== null).length;
  const progress = (answeredCount / totalQ) * 100;
  const isLastQ = currentIndex === totalQ - 1;

  const handleSubmitAnswer = async () => {
    if (!transcript.trim() && !recordingDone) {
      toast.error("Record your answer first, then submit.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        questionId: currentQ._id,
        answer: transcript,
        ...(mlData || {}),
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
  };

  const handleNext = () => {
    if (isLastQ) navigate(`/interview/${id}/report`);
    else {
      setFeedback(null);
      setTranscript("");
      setMlData(null);
      setRecordingDone(false);
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
        setRecordingDone(false);
        setCurrentIndex((i) => i + 1);
      }
    } catch {
      toast.error("Couldn’t skip this question. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell relative max-w-7xl overflow-x-hidden py-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,420px)] opacity-90"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% -10%, rgba(255,126,95,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 0%, rgba(157,80,187,0.06) 0%, transparent 45%)`,
        }}
        aria-hidden
      />

      <header className="relative mb-10 border-b border-slate-200/80 pb-8 dark:border-slate-700/70">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-outline py-2 text-xs font-semibold" onClick={() => navigate("/dashboard")}>
              ← Exit
            </button>
            <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm ring-1 ring-white/80 backdrop-blur-sm dark:border-slate-600/80 dark:bg-slate-900/80 dark:text-slate-300 dark:ring-slate-700/60">
              {interview.jobRole}
            </span>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Progress</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
              {answeredCount} <span className="font-normal text-slate-400 dark:text-slate-500">/</span> {totalQ}{" "}
              <span className="font-normal text-slate-500 dark:text-slate-400">answered</span>
            </p>
          </div>
        </div>

        <div className="progress-track h-2 shadow-inner ring-1 ring-slate-900/[0.03]">
          <div className="progress-fill-bar h-full" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <div
              key={q._id}
              title={q.score !== null ? `Scored ${q.score}/10` : i === currentIndex ? "Current" : "Upcoming"}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-300 sm:h-9 sm:w-9 ${
                q.score !== null
                  ? q.score >= 7
                    ? "border-emerald-300/90 bg-emerald-50 text-emerald-800 shadow-sm"
                    : q.score >= 4
                      ? "border-amber-300/90 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-rose-300/90 bg-rose-50 text-rose-800 shadow-sm"
                  : i === currentIndex
                    ? "border-aura-violet/40 bg-white text-aura-ink shadow-[0_0_0_3px_rgba(157,80,187,0.12),0_8px_20px_-8px_rgba(15,23,42,0.12)] ring-1 ring-aura-violet/20 dark:bg-slate-900 dark:shadow-[0_0_0_3px_rgba(157,80,187,0.2),0_8px_20px_-8px_rgba(0,0,0,0.35)]"
                    : "border-slate-200/90 bg-slate-50/90 text-slate-500 dark:border-slate-600/80 dark:bg-slate-800/70 dark:text-slate-400"
              }`}
            >
              {i + 1}
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

      <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="glass-panel-lg relative overflow-hidden border-slate-200/90 p-6 shadow-lux md:p-8">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-aura-coral/15 to-aura-violet/10 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Question {String(currentIndex + 1).padStart(2, "0")} — {String(totalQ).padStart(2, "0")}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {currentQ.questionType === "follow_up" && (
                    <span className="rounded-md border border-aura-violet/25 bg-aura-violet/[0.08] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-aura-violet">
                      Adaptive follow-up
                    </span>
                  )}
                  <span className="rounded-md bg-slate-100/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/90 dark:text-slate-400">
                    Live session
                  </span>
                </div>
              </div>
              <p className="text-lg font-medium leading-relaxed tracking-tight text-aura-ink md:text-xl md:leading-relaxed">{currentQ.text}</p>
            </div>
          </div>

          {!feedback && (
            <div className="glass-panel relative overflow-hidden rounded-2xl border-slate-200/90 p-5 md:p-6">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-aura-coral to-aura-violet" aria-hidden />
              <div className="pl-4">
                <span className="section-eyebrow mb-3 inline-flex">Coaching brief</span>
                <ul className="space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aura-violet/60" aria-hidden />
                    <span>Use STAR: situation, task, action, result — keep the arc tight.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aura-violet/60" aria-hidden />
                    <span>Look at the camera lens; steady gaze reads as confidence on video.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aura-violet/60" aria-hidden />
                    <span>Cut fillers (“um”, “like”); aim for roughly 130–170 words per minute.</span>
                  </li>
                </ul>
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
                <div className="mb-6 rounded-2xl border border-aura-violet/20 bg-gradient-to-br from-aura-violet/[0.07] to-white/90 p-4 ring-1 ring-aura-violet/10">
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
                      <MetricTile label="Confidence (ML)" className="col-span-2 border-aura-violet/25 bg-gradient-to-br from-aura-violet/[0.07] to-white/90">
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
            <div className="glass-panel rounded-2xl border-slate-200/90 p-5 shadow-sm md:p-6">
              <label className="label-field">Live transcript</label>
              <div className="max-h-48 min-h-[108px] overflow-y-auto rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 text-sm leading-relaxed text-slate-600 ring-1 ring-white/60 dark:border-slate-600/80 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/50 md:max-h-64">
                {transcript ? (
                  <div className="italic text-slate-700 dark:text-slate-200">{renderTranscriptWithFillerHighlights(transcript)}</div>
                ) : (
                  <span className="italic text-slate-400 dark:text-slate-500">Start recording — your words appear here in real time.</span>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-24 xl:w-[400px] xl:self-start">
          <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-1 shadow-lux-lg ring-1 ring-white/70 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70 dark:ring-slate-700/50">
            <div className="rounded-xl bg-slate-50/80 px-4 py-2.5 text-center dark:bg-slate-800/60">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Camera & coaching</p>
            </div>
            <div className="p-3 sm:p-4">
              <CameraRecorder
                key={currentIndex}
                onTranscriptChange={setTranscript}
                onRecordingComplete={() => setRecordingDone(true)}
                onMLData={setMlData}
                disabled={!!feedback}
                showTranscript={false}
                metricsLayout="below"
              />
            </div>
          </div>

          {!feedback && (
            <div className="flex flex-col gap-2.5 sm:flex-row xl:flex-col">
              <button type="button" className="btn-cta flex-1 justify-center py-3.5 text-sm" onClick={handleSubmitAnswer} disabled={submitting}>
                {submitting ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white"
                      aria-hidden
                    />{" "}
                    Scoring answer…
                  </>
                ) : (
                  <>
                    Submit answer <span aria-hidden>→</span>
                  </>
                )}
              </button>
              <button type="button" className="btn-outline flex-1 justify-center py-3 text-sm font-semibold xl:w-full" onClick={handleSkip} disabled={submitting}>
                Skip question
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
