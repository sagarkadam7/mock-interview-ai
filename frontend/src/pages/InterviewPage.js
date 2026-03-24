import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview, submitAnswer } from "../utils/api";
import CameraRecorder from "../components/CameraRecorder";

export default function InterviewPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [interview,    setInterview]    = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript,   setTranscript]   = useState("");
  const [mlData,       setMlData]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [feedback,     setFeedback]     = useState(null);
  const [error,        setError]        = useState("");
  const [recordingDone,setRecordingDone]= useState(false);

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

  if (loading) return (
    <div className="page" style={{ textAlign:"center" }}>
      <span className="spinner" style={{ width:40, height:40 }} />
      <p style={{ marginTop:20, color:"var(--text2)" }}>Loading your interview...</p>
    </div>
  );

  if (!interview) return null;

  const questions     = interview.questions;
  const currentQ      = questions[currentIndex];
  const totalQ        = questions.length;
  const answeredCount = questions.filter((q) => q.score !== null).length;
  const progress      = (answeredCount / totalQ) * 100;
  const isLastQ       = currentIndex === totalQ - 1;

  const handleSubmitAnswer = async () => {
    if (!transcript.trim() && !recordingDone) {
      return setError("Please record your answer before submitting.");
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
    } catch (err) {
      setError("Failed to get AI feedback. Please try again.");
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
    if (!window.confirm("Skip this question?")) return;
    setSubmitting(true);
    try {
      await submitAnswer(id, { questionId: currentQ._id, answer: "" });
      if (isLastQ) navigate(`/interview/${id}/report`);
      else { setFeedback(null); setTranscript(""); setMlData(null); setRecordingDone(false); setCurrentIndex((i) => i + 1); }
    } catch { setError("Failed to skip."); }
    finally { setSubmitting(false); }
  };

  const scoreColor = (s) => s >= 7 ? "var(--green)" : s >= 4 ? "var(--amber)" : "var(--red)";
  const eyeColor   = (p) => p > 70 ? "var(--green)" : p > 40 ? "var(--amber)" : "var(--red)";

  return (
    <div className="page">
      <div style={{ maxWidth:900, margin:"0 auto" }}>

        {/* Progress */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="btn btn-outline" style={{ padding:"6px 14px", fontSize:13 }} onClick={() => navigate("/dashboard")}>← Exit</button>
              <span style={{ fontSize:14, color:"var(--text2)" }}>{interview.jobRole}</span>
            </div>
            <span style={{ fontSize:14, color:"var(--text2)", fontWeight:500 }}>{answeredCount}/{totalQ} answered</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>
          <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
            {questions.map((q, i) => (
              <div key={q._id} style={{
                width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:600, border: i === currentIndex ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: q.score !== null ? (q.score >= 7 ? "rgba(34,197,94,0.2)" : q.score >= 4 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)") : i === currentIndex ? "rgba(108,99,255,0.15)" : "var(--bg3)",
                color: q.score !== null ? (q.score >= 7 ? "var(--green)" : q.score >= 4 ? "var(--amber)" : "var(--red)") : i === currentIndex ? "var(--accent2)" : "var(--text3)",
              }}>{i + 1}</div>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid-2" style={{ gap:28, alignItems:"start" }}>

          {/* Left: Question + feedback */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div className="card" style={{ borderColor:"var(--accent)" }}>
              <div style={{ fontSize:12, color:"var(--accent2)", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:12 }}>
                Question {currentIndex + 1} of {totalQ}
              </div>
              <p style={{ fontSize:18, lineHeight:1.6 }}>{currentQ.text}</p>
            </div>

            {!feedback && (
              <div className="card-sm" style={{ fontSize:13, color:"var(--text2)" }}>
                <strong style={{ color:"var(--text)", display:"block", marginBottom:8 }}>💡 Tips</strong>
                <ul style={{ paddingLeft:16, lineHeight:2 }}>
                  <li>Use the STAR method: Situation, Task, Action, Result</li>
                  <li>Look directly at the camera for eye contact</li>
                  <li>Avoid filler words: um, uh, like, basically</li>
                  <li>Aim for 130–170 words per minute</li>
                </ul>
              </div>
            )}

            {/* AI + ML Feedback */}
            {feedback && (
              <div className="card animate-fade" style={{ borderColor:"rgba(108,99,255,0.4)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>AI Feedback</h3>
                  <span style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color: scoreColor(feedback.score) }}>
                    {feedback.score}<span style={{ fontSize:14, color:"var(--text3)" }}>/10</span>
                  </span>
                </div>

                <div className="progress-bar" style={{ marginBottom:16 }}>
                  <div className="progress-fill" style={{ width:`${feedback.score*10}%`, background: scoreColor(feedback.score) }} />
                </div>

                <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, marginBottom:16 }}>{feedback.feedback}</p>

                {/* ML scores grid */}
                {feedback.mlData && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {feedback.mlData.eyeContactPct !== null && (
                      <div style={{ background:"var(--bg3)", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>👁 Eye contact</div>
                        <div style={{ fontSize:18, fontWeight:700, color: eyeColor(feedback.mlData.eyeContactPct) }}>
                          {feedback.mlData.eyeContactPct}%
                        </div>
                      </div>
                    )}
                    {feedback.mlData.wordsPerMinute > 0 && (
                      <div style={{ background:"var(--bg3)", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>📊 Speech pace</div>
                        <div style={{ fontSize:18, fontWeight:700, color: feedback.mlData.paceLabel === "good" ? "var(--green)" : "var(--amber)" }}>
                          {feedback.mlData.wordsPerMinute} wpm
                          <span style={{ fontSize:11, fontWeight:400, color:"var(--text3)", marginLeft:6 }}>({feedback.mlData.paceLabel})</span>
                        </div>
                      </div>
                    )}
                    {feedback.mlData.fillerWordCount !== null && (
                      <div style={{ background:"var(--bg3)", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>🗣 Filler words</div>
                        <div style={{ fontSize:18, fontWeight:700, color: feedback.mlData.fillerWordCount > 5 ? "var(--red)" : feedback.mlData.fillerWordCount > 2 ? "var(--amber)" : "var(--green)" }}>
                          {feedback.mlData.fillerWordCount}
                          {feedback.mlData.fillerWords?.length > 0 && (
                            <span style={{ fontSize:11, fontWeight:400, color:"var(--text3)", marginLeft:6 }}>
                              ({feedback.mlData.fillerWords.slice(0,3).join(", ")})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {feedback.mlData.dominantEmotion && (
                      <div style={{ background:"var(--bg3)", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>😐 Expression</div>
                        <div style={{ fontSize:16, fontWeight:600, color:"var(--text)", textTransform:"capitalize" }}>
                          {feedback.mlData.dominantEmotion}
                        </div>
                      </div>
                    )}
                    {feedback.mlData.confidenceScore !== null && (
                      <div style={{ background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:10, padding:"12px 14px", gridColumn:"1/-1" }}>
                        <div style={{ fontSize:11, color:"var(--accent2)", marginBottom:4 }}>⭐ Confidence score (ML)</div>
                        <div style={{ fontSize:22, fontWeight:700, color:"var(--accent2)" }}>
                          {feedback.mlData.confidenceScore}/10
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                  <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:10, padding:"12px 16px" }}>
                    <div style={{ fontSize:11, color:"var(--green)", fontWeight:600, marginBottom:4 }}>✓ STRENGTHS</div>
                    <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{feedback.strengths}</p>
                  </div>
                  <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, padding:"12px 16px" }}>
                    <div style={{ fontSize:11, color:"var(--amber)", fontWeight:600, marginBottom:4 }}>↑ IMPROVEMENTS</div>
                    <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{feedback.improvements}</p>
                  </div>
                </div>

                <button className="btn btn-primary btn-full" onClick={handleNext}>
                  {isLastQ ? "View Full Report →" : `Next Question (${currentIndex+2}/${totalQ}) →`}
                </button>
              </div>
            )}
          </div>

          {/* Right: Camera */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <CameraRecorder
              key={currentIndex}
              onTranscriptChange={setTranscript}
              onRecordingComplete={() => setRecordingDone(true)}
              onMLData={setMlData}
              disabled={!!feedback}
            />

            {!feedback && (
              <div style={{ display:"flex", gap:10 }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}
                  onClick={handleSubmitAnswer} disabled={submitting}>
                  {submitting ? <><span className="spinner" /> Getting AI feedback...</> : "Submit Answer →"}
                </button>
                <button className="btn btn-outline" onClick={handleSkip} disabled={submitting} style={{ padding:"12px 16px" }}>Skip</button>
              </div>
            )}

            {!feedback && transcript && (
              <div>
                <label>Your transcript</label>
                <div className="transcript-box" style={{ maxHeight:120, overflowY:"auto" }}>{transcript}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}