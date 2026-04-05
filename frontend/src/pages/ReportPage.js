import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInterview } from "../utils/api";
import { generatePDFReport } from "../utils/pdfReport";
import { RadarChart, Sparkline } from "../components/Charts";

const scoreColor = (s) => s >= 7 ? "var(--green)" : s >= 4 ? "var(--amber)" : s !== null ? "var(--red)" : "var(--text3)";
const eyeColor   = (p) => p > 70 ? "var(--green)" : p > 40 ? "var(--amber)" : "var(--red)";
const paceColor  = (l) => l === "good" ? "var(--green)" : "var(--amber)";
const emotionEmoji = { happy:"😊", neutral:"😐", sad:"😔", fearful:"😰", angry:"😠", disgusted:"🤢", surprised:"😲" };

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card-sm" style={{ textAlign:"center" }}>
      <div style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color: color || "var(--accent2)", marginBottom:4 }}>{value ?? "—"}</div>
      <div style={{ fontSize:12, color:"var(--text2)", marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"var(--text3)" }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height:6, background:"var(--border)", borderRadius:99, overflow:"hidden", flex:1 }}>
      <div style={{ height:"100%", width:`${pct}%`, background: color || "var(--accent)", borderRadius:99, transition:"width 0.5s ease" }} />
    </div>
  );
}

function EmotionBar({ emotions }) {
  if (!emotions) return null;
  const entries = Object.entries(emotions).sort((a,b) => b[1]-a[1]).slice(0,4);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {entries.map(([k, v]) => (
        <div key={k} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:14, width:20 }}>{emotionEmoji[k] || "😐"}</span>
          <span style={{ fontSize:12, color:"var(--text2)", width:70, textTransform:"capitalize" }}>{k}</span>
          <MiniBar value={v} max={1} color={k === "happy" || k === "neutral" ? "var(--green)" : k === "fearful" || k === "sad" ? "var(--red)" : "var(--amber)"} />
          <span style={{ fontSize:11, color:"var(--text3)", width:36, textAlign:"right" }}>{Math.round(v*100)}%</span>
        </div>
      ))}
    </div>
  );
}

function QuestionCard({ question, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="card" style={{ padding:0, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"18px 24px", background:"none", border:"none", cursor:"pointer", gap:16, textAlign:"left",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, flex:1 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--bg3)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--text2)", flexShrink:0 }}>
            {index+1}
          </div>
          <p style={{ fontSize:15, fontWeight:500, lineHeight:1.4 }}>{question.text}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
          {question.score !== null && (
            <span style={{ fontSize:18, fontFamily:"'DM Serif Display',serif", color: scoreColor(question.score) }}>
              {question.score}<span style={{ fontSize:10, color:"var(--text3)" }}>/10</span>
            </span>
          )}
          {question.eyeContactPct !== null && (
            <span style={{ fontSize:12, color: eyeColor(question.eyeContactPct) }}>👁 {question.eyeContactPct}%</span>
          )}
          <span style={{ color:"var(--text3)", fontSize:16 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop:"1px solid var(--border)", padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          {/* ML metrics row */}
          {(question.eyeContactPct !== null || question.wordsPerMinute > 0 || question.fillerWordCount !== null || question.confidenceScore !== null) && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {question.eyeContactPct !== null && (
                <div style={{ background:"var(--bg3)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"var(--text3)", marginBottom:3 }}>👁 Eye contact</div>
                  <div style={{ fontSize:16, fontWeight:700, color: eyeColor(question.eyeContactPct) }}>{question.eyeContactPct}%</div>
                </div>
              )}
              {question.wordsPerMinute > 0 && (
                <div style={{ background:"var(--bg3)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"var(--text3)", marginBottom:3 }}>📊 Pace</div>
                  <div style={{ fontSize:14, fontWeight:700, color: paceColor(question.paceLabel) }}>{question.wordsPerMinute} wpm</div>
                  <div style={{ fontSize:10, color:"var(--text3)", textTransform:"capitalize" }}>{question.paceLabel}</div>
                </div>
              )}
              {question.fillerWordCount !== null && (
                <div style={{ background:"var(--bg3)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"var(--text3)", marginBottom:3 }}>🗣 Fillers</div>
                  <div style={{ fontSize:16, fontWeight:700, color: question.fillerWordCount > 5 ? "var(--red)" : question.fillerWordCount > 2 ? "var(--amber)" : "var(--green)" }}>{question.fillerWordCount}</div>
                </div>
              )}
              {question.confidenceScore !== null && (
                <div style={{ background:"rgba(108,99,255,0.08)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"var(--accent2)", marginBottom:3 }}>⭐ Confidence</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"var(--accent2)" }}>{question.confidenceScore}/10</div>
                </div>
              )}
            </div>
          )}

          {/* Emotion bars */}
          {question.dominantEmotion && (
            <div>
              <div style={{ fontSize:11, color:"var(--text3)", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>Expression analysis</div>
              <EmotionBar emotions={question.emotionScores} />
            </div>
          )}

          {/* Answer */}
          {question.answer ? (
            <div>
              <div style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Your answer</div>
              <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, fontStyle:"italic" }}>"{question.answer}"</p>
              {question.fillerWords?.length > 0 && (
                <p style={{ fontSize:12, color:"var(--text3)", marginTop:6 }}>
                  Filler words detected: {question.fillerWords.map(w => `"${w}"`).join(", ")}
                </p>
              )}
            </div>
          ) : (
            <p style={{ fontSize:14, color:"var(--text3)", fontStyle:"italic" }}>No answer recorded.</p>
          )}

          <div className="divider" style={{ margin:"4px 0" }} />

          {question.feedback && (
            <div>
              <div style={{ fontSize:11, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>AI Feedback</div>
              <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7 }}>{question.feedback}</p>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {question.strengths && (
              <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--green)", marginBottom:6 }}>✓ STRENGTHS</div>
                <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{question.strengths}</p>
              </div>
            )}
            {question.improvements && (
              <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--amber)", marginBottom:6 }}>↑ IMPROVEMENTS</div>
                <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{question.improvements}</p>
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
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getInterview(id)
      .then(({ data }) => setInterview(data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="page" style={{ textAlign:"center" }}>
      <span className="spinner" style={{ width:40, height:40 }} />
      <p style={{ marginTop:20, color:"var(--text2)" }}>Loading your report...</p>
    </div>
  );

  if (!interview) return null;

  const answered = interview.questions.filter((q) => q.score !== null);
  const overall  = interview.overallScore;
  const overallColor = overall >= 7 ? "var(--green)" : overall >= 4 ? "var(--amber)" : "var(--red)";

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

  const coachingDims = [
    { key: "Eye", value: eyeN, color: "var(--cyan2)", msg: "Focus on steady eye contact. Try pausing and resetting your gaze to the lens." },
    { key: "Conf", value: confN, color: "var(--accent2)", msg: "Build confidence by structuring answers (STAR). Aim for clear, complete sentences." },
    { key: "Pace", value: paceN, color: "var(--green)", msg: "Dial in your pace. Aiming for ~130–170 wpm often boosts clarity and confidence." },
    { key: "Fill", value: fillerN, color: "var(--amber)", msg: "Reduce filler words. If you feel stuck, pause for 1 second before continuing." },
  ];

  const focusDim = coachingDims.reduce((min, d) => (d.value < min.value ? d : min), coachingDims[0]);

  const questionScores = interview.questions.map((q) => q.score).filter((s) => typeof s === "number");
  const eyeTrend = interview.questions.map((q) => q.eyeContactPct).filter((p) => typeof p === "number");

  return (
    <div className="page animate-fade">
      <div style={{ maxWidth:820, margin:"0 auto" }}>

        {/* Header card */}
        <div className="card" style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20, marginBottom:20 }}>
            <div>
              <div style={{ fontSize:11, color:"var(--text3)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Interview Report</div>
              <h2 style={{ marginBottom:6 }}>{interview.jobRole}</h2>
              <p style={{ fontSize:14, color:"var(--text2)" }}>
                {new Date(interview.createdAt).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
              </p>
              <p style={{ fontSize:14, color:"var(--text2)", marginTop:4 }}>{answered.length}/{interview.questions.length} questions answered</p>
            </div>
            {overall !== null && (
              <div style={{ textAlign:"center" }}>
                <div style={{ width:96, height:96, borderRadius:"50%", border:`3px solid ${overallColor}`, background:`${overallColor}18`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:28, fontFamily:"'DM Serif Display',serif", color:overallColor, lineHeight:1 }}>{overall}</span>
                  <span style={{ fontSize:10, color:"var(--text3)" }}>/10</span>
                </div>
                <p style={{ fontSize:11, color:"var(--text3)", marginTop:6 }}>AI content score</p>
              </div>
            )}
          </div>

          {/* ML overview stats */}
          <div className="grid-2" style={{ gap:12, marginBottom:20 }}>
            <StatCard label="Avg eye contact" value={interview.avgEyeContact !== null ? `${interview.avgEyeContact}%` : null} color={interview.avgEyeContact > 70 ? "var(--green)" : interview.avgEyeContact > 40 ? "var(--amber)" : "var(--red)"} />
            <StatCard label="Avg confidence (ML)" value={interview.avgConfidence !== null ? `${interview.avgConfidence}/10` : null} color="var(--accent2)" />
            <StatCard label="Avg speech pace" value={interview.avgPace ? `${interview.avgPace} wpm` : null} sub={interview.avgPace ? (interview.avgPace >= 100 && interview.avgPace <= 180 ? "good pace" : "needs adjustment") : null} color={interview.avgPace >= 100 && interview.avgPace <= 180 ? "var(--green)" : "var(--amber)"} />
            <StatCard label="Avg filler words / Q" value={interview.avgFillerWords !== null ? interview.avgFillerWords : null} color={interview.avgFillerWords <= 2 ? "var(--green)" : interview.avgFillerWords <= 5 ? "var(--amber)" : "var(--red)"} />
          </div>

          {/* Radar summary */}
          <div className="card" style={{ marginBottom: 20, padding: "18px 18px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <div className="tag" style={{ marginBottom: 8 }}>METRIC RADAR</div>
                <h3 style={{ marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>Your coaching snapshot</h3>
                <p style={{ color: "var(--text3)", fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>
                  Larger shape = better performance for that dimension.
                </p>
              </div>
              <div style={{ width: 220, minWidth: 220, textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>How to read</div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
                  Eye: higher is better<br />
                  Conf: higher is better<br />
                  Pace: closer to 130–170 wpm<br />
                  Fillers: lower is better
                </div>
              </div>
            </div>
            <RadarChart metrics={radarMetrics} stroke="var(--accent2)" fill="rgba(168,85,247,0.10)" />

            {/* Focus callout */}
            <div style={{ marginTop: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 4 }}>
                    Next focus
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: focusDim.color, marginBottom: 4 }}>
                    {focusDim.key}
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7 }}>
                    {focusDim.msg}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Your score
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Syne',sans-serif", color: focusDim.color, lineHeight: 1 }}>
                    {Math.round(focusDim.value * 10)}/10
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend charts */}
          <div className="grid-2" style={{ gap:12, marginBottom: 24 }}>
            <div className="card-sm" style={{ padding: 16 }}>
              <div className="tag" style={{ marginBottom: 10 }}>TRENDS</div>
              <h3 style={{ marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>Question score</h3>
              {questionScores.length >= 2 ? (
                <Sparkline data={questionScores} stroke="var(--accent2)" fill="rgba(34,197,238,0.10)" />
              ) : (
                <div style={{ color: "var(--text3)", fontSize: 13 }}>No enough scores yet.</div>
              )}
            </div>

            <div className="card-sm" style={{ padding: 16 }}>
              <div className="tag" style={{ marginBottom: 10 }}>TRENDS</div>
              <h3 style={{ marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>Eye contact</h3>
              {eyeTrend.length >= 2 ? (
                <Sparkline data={eyeTrend} stroke="var(--green)" fill="rgba(16,185,129,0.10)" />
              ) : (
                <div style={{ color: "var(--text3)", fontSize: 13 }}>No eye contact data yet.</div>
              )}
            </div>
          </div>

          {/* Performance summary */}
          {overall !== null && (
            <div style={{ background:"var(--bg3)", borderRadius:10, padding:"14px 18px", fontSize:15, color:"var(--text)", lineHeight:1.7, marginBottom:20 }}>
              {overall >= 8 ? "🌟 Outstanding performance! You're interview-ready."
               : overall >= 6 ? "👍 Good job overall! Focus on the improvement areas below."
               : overall >= 4 ? "📈 You're on the right track. Review the feedback carefully."
               : "💪 Keep practicing! Every session makes you better."}
            </div>
          )}

          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button className="btn btn-primary" onClick={() => generatePDFReport(interview)}>↓ Download PDF Report</button>
            <Link to="/interview/new"><button className="btn btn-outline">+ New Interview</button></Link>
            <Link to="/dashboard"><button className="btn btn-outline">← Dashboard</button></Link>
          </div>
        </div>

        {/* Per-question breakdown */}
        <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, marginBottom:16 }}>Question-by-question breakdown</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {interview.questions.map((q, i) => <QuestionCard key={q._id} question={q} index={i} />)}
        </div>

        <div style={{ textAlign:"center", padding:"40px 0 20px" }}>
          <Link to="/interview/new">
            <button className="btn btn-primary" style={{ fontSize:15, padding:"12px 28px" }}>Start Another Interview →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}