import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: "◈", title: "Resume-aware questions", desc: "Claude reads your resume and job description to generate questions that test exactly your experience — not generic ones.", color: "#6366f1" },
  { icon: "◉", title: "Real-time eye tracking", desc: "MediaPipe FaceMesh tracks 468 facial landmarks including your iris to measure eye contact percentage throughout each answer.", color: "#22d3ee" },
  { icon: "◆", title: "Live speech analysis", desc: "Web Speech API transcribes your answer in real time. Filler words (um, uh, like) are detected and speech pace is calculated.", color: "#a855f7" },
  { icon: "◎", title: "Instant AI scoring", desc: "Gemini AI evaluates your answer with a 0–10 score, detailed feedback, strengths, and specific improvement suggestions.", color: "#10b981" },
];

const steps = [
  { n: "01", title: "Upload your resume", desc: "Paste text or upload a PDF. Add the job description for even more targeted questions." },
  { n: "02", title: "Face 7 AI questions", desc: "Gemini generates questions tailored to your background. Each is different — behavioral, technical, situational." },
  { n: "03", title: "Answer on camera", desc: "Record each answer while MediaPipe tracks your eye contact and the mic transcribes every word in real time." },
  { n: "04", title: "Get your report", desc: "See AI scores, eye contact %, speech pace, filler words, confidence score — all in one detailed PDF report." },
];

export default function LandingPage() {
  const { user } = useAuth();
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      hero.style.setProperty("--mx", `${x * 100}%`);
      hero.style.setProperty("--my", `${y * 100}%`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: "88vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", textAlign: "center",
        padding: "80px 24px 60px",
        position: "relative",
        background: `radial-gradient(ellipse 60% 50% at var(--mx, 50%) var(--my, 40%), rgba(99,102,241,0.08) 0%, transparent 70%)`,
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <div style={{ marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: 12, color: "var(--indigo2)", fontWeight: 600, letterSpacing: "0.05em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--indigo)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            POWERED BY GEMINI AI + MEDIAPIPE
          </div>

          <h1 style={{ marginBottom: 24 }}>
            Practice interviews with{" "}
            <span className="text-grad">AI that sees you</span>
          </h1>

          <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "var(--text2)", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.75 }}>
            Upload your resume. Get personalized questions. Answer on camera while AI tracks your eye contact, speech pace, and confidence in real time.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={user ? "/dashboard" : "/register"}>
              <button className="btn btn-grad btn-lg" style={{ fontSize: 16, padding: "14px 36px" }}>
                Start for free →
              </button>
            </Link>
            {!user && (
              <Link to="/login">
                <button className="btn btn-outline btn-lg">
                  Sign in
                </button>
              </Link>
            )}
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 56, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            {[["4 AI/ML", "technologies"], ["468", "face landmarks"], ["Real-time", "analysis"], ["Free", "forever"]].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="tag" style={{ marginBottom: 16 }}>FEATURES</div>
          <h2>Everything you need to ace the interview</h2>
        </div>

        <div className="grid-2">
          {features.map((f, i) => (
            <div key={f.title} className="card animate-fade-up" style={{
              animationDelay: `${i * 0.1}s`,
              borderColor: `${f.color}18`,
              transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
              cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${f.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${f.color}18`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ fontSize: 28, color: f.color, marginBottom: 16, lineHeight: 1 }}>{f.icon}</div>
              <h3 style={{ marginBottom: 10, fontFamily: "'Syne',sans-serif" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.04), transparent)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="tag" style={{ marginBottom: 16 }}>HOW IT WORKS</div>
            <h2>From resume to report in minutes</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ position: "relative" }}>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 20, left: "calc(50% + 24px)", width: "calc(100% - 48px)", height: 1, background: "linear-gradient(90deg, var(--border2), transparent)", display: "none" }} />
                )}
                <div className="card-sm" style={{ textAlign: "center", height: "100%" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--indigo2)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.1em" }}>{s.n}</div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1rem", marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ marginBottom: 16 }}>
            Ready to <span className="text-grad2">level up</span> your interviews?
          </h2>
          <p style={{ color: "var(--text2)", marginBottom: 40, fontSize: 16 }}>
            No credit card. No sign-up fee. Just better interview performance.
          </p>
          <Link to={user ? "/interview/new" : "/register"}>
            <button className="btn btn-grad btn-lg" style={{ fontSize: 16, padding: "16px 48px" }}>
              Start practising free →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}