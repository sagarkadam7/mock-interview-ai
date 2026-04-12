import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getInterview, submitAnswer } from "../utils/api";
import { useConfirm } from "../context/ConfirmContext";
import CameraRecorder, { renderTranscriptWithFillerHighlights } from "../components/CameraRecorder";

const scoreColor = (s) => (s >= 7 ? "text-emerald-400" : s >= 4 ? "text-amber-400" : "text-rose-400");
const eyeColor = (p) => (p > 70 ? "text-emerald-400" : p > 40 ? "text-amber-400" : "text-rose-400");
const paceColor = (l) => (l === "good" ? "text-emerald-400" : "text-amber-400");

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
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <span className="spinner h-10 w-10" />
        <p className="mt-5 text-sm text-aura-muted">Loading your interview...</p>
      </div>
    );
  }

  if (!interview) return null;

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
      await submitAnswer(id, { questionId: currentQ._id, answer: "" });
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
    <div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8">
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-outline py-2 text-xs" onClick={() => navigate("/dashboard")}>
              ← Exit
            </button>
            <span className="text-sm font-medium text-aura-muted">{interview.jobRole}</span>
          </div>
          <span className="text-sm font-medium text-aura-muted">
            {answeredCount}/{totalQ} answered
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {questions.map((q, i) => (
            <div
              key={q._id}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-all duration-300 ${
                q.score !== null
                  ? q.score >= 7
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : q.score >= 4
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                      : "border-rose-500/40 bg-rose-500/15 text-rose-400"
                  : i === currentIndex
                    ? "border-aura-coral/60 bg-aura-violet/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-aura-muted"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      )}

      {/* Main + sidebar: left = copy & transcript, right = camera & coaching (sticky on xl) */}
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
        {/* Left: primary content (~8/12) */}
        <div className="min-w-0 flex-1 space-y-5">
          <div className="glass-panel-lg border-white/10 p-6 md:p-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-aura-muted">
              Question {currentIndex + 1} of {totalQ}
            </div>
            <p className="text-lg font-medium leading-relaxed tracking-tight text-white">{currentQ.text}</p>
          </div>

          {!feedback && (
            <div className="glass-panel rounded-2xl p-5 text-sm text-aura-muted md:p-6">
              <strong className="mb-2 block font-semibold text-white">💡 Tips</strong>
              <ul className="list-disc space-y-1 pl-5 leading-relaxed">
                <li>Use the STAR method: Situation, Task, Action, Result</li>
                <li>Look directly at the camera for eye contact</li>
                <li>Avoid filler words: um, uh, like, basically</li>
                <li>Aim for 130–170 words per minute</li>
              </ul>
            </div>
          )}

          {feedback && (
            <div className="glass-panel-lg animate-page-in border-white/10 p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold tracking-tight text-white">AI Feedback</h3>
                <span className={`font-sans text-3xl font-bold ${scoreColor(feedback.score)}`}>
                  {feedback.score}
                  <span className="text-sm font-normal text-aura-muted">/10</span>
                </span>
              </div>
              <div className="progress-track mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aura-coral to-aura-violet transition-all duration-500"
                  style={{ width: `${feedback.score * 10}%`, boxShadow: "0 0 12px rgba(157, 80, 187, 0.35)" }}
                />
              </div>
              <p className="mb-4 text-sm leading-relaxed text-aura-muted">{feedback.feedback}</p>

              {feedback.mlData && (
                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  {feedback.mlData.eyeContactPct !== null && (
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">👁 Eye</div>
                      <div className={`text-lg font-bold ${eyeColor(feedback.mlData.eyeContactPct)}`}>
                        {feedback.mlData.eyeContactPct}%
                      </div>
                    </div>
                  )}
                  {feedback.mlData.wordsPerMinute > 0 && (
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">📊 Pace</div>
                      <div className={`text-base font-bold ${paceColor(feedback.mlData.paceLabel)}`}>
                        {feedback.mlData.wordsPerMinute} wpm
                        <span className="ml-1 text-xs font-normal text-aura-muted">({feedback.mlData.paceLabel})</span>
                      </div>
                    </div>
                  )}
                  {feedback.mlData.fillerWordCount !== null && (
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">🗣 Fillers</div>
                      <div
                        className={`text-lg font-bold ${
                          feedback.mlData.fillerWordCount > 5
                            ? "text-rose-400"
                            : feedback.mlData.fillerWordCount > 2
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {feedback.mlData.fillerWordCount}
                      </div>
                    </div>
                  )}
                  {feedback.mlData.dominantEmotion && (
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-muted">Expression</div>
                      <div className="text-base font-semibold capitalize text-white">{feedback.mlData.dominantEmotion}</div>
                    </div>
                  )}
                  {feedback.mlData.confidenceScore !== null && (
                    <div className="col-span-2 rounded-xl border border-aura-violet/30 bg-aura-violet/10 p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-aura-coral">⭐ Confidence (ML)</div>
                      <div className="text-2xl font-bold text-white">{feedback.mlData.confidenceScore}/10</div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4 flex flex-col gap-2.5">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">✓ Strengths</div>
                  <p className="text-sm leading-relaxed text-aura-muted">{feedback.strengths}</p>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-400">↑ Improvements</div>
                  <p className="text-sm leading-relaxed text-aura-muted">{feedback.improvements}</p>
                </div>
              </div>

              <button type="button" className="btn-primary w-full" onClick={handleNext}>
                {isLastQ ? "View Full Report →" : `Next Question (${currentIndex + 2}/${totalQ}) →`}
              </button>
            </div>
          )}

          {/* Live transcript lives with question flow (wide column) */}
          {!feedback && (
            <div className="glass-panel rounded-2xl p-5 md:p-6">
              <label className="label-field">Live transcript</label>
              <div className="max-h-48 min-h-[100px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm italic leading-relaxed text-aura-muted md:max-h-64">
                {transcript ? (
                  renderTranscriptWithFillerHighlights(transcript)
                ) : (
                  "Start recording and speak — your words will appear here in real time…"
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: fixed-width sidebar — camera, coaching, record controls */}
        <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-24 xl:w-[400px] xl:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-aura-muted">Camera & coaching</p>
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

          {!feedback && (
            <div className="flex flex-col gap-2.5 sm:flex-row xl:flex-col">
              <button type="button" className="btn-primary flex-1" onClick={handleSubmitAnswer} disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner h-4 w-4" /> Getting AI feedback...
                  </>
                ) : (
                  "Submit Answer →"
                )}
              </button>
              <button type="button" className="btn-outline px-4 xl:w-full" onClick={handleSkip} disabled={submitting}>
                Skip
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
