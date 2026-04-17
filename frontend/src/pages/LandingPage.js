import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useReducedMotion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import SiteFooter from "../components/SiteFooter";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import ComparisonSection from "../components/landing/ComparisonSection";
import PersonasSection from "../components/landing/PersonasSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import PricingTeaserSection from "../components/landing/PricingTeaserSection";
import SecuritySection from "../components/landing/SecuritySection";
import FAQSection from "../components/landing/FAQSection";

const features = [
  {
    icon: "◈",
    title: "Resume-aware AI",
    desc: "Gemini analyzes your PDF and job description to generate hyper-specific technical questions.",
    glow: "from-aura-coral/25 to-aura-violet/20",
  },
  {
    icon: "◉",
    title: "Real-time eye tracking",
    desc: "MediaPipe maps gaze at 30fps so you build consistent camera contact under pressure.",
    glow: "from-aura-violet/25 to-aura-coral/15",
  },
  {
    icon: "◆",
    title: "Live speech analytics",
    desc: "Browser-native transcription flags filler words and measures words per minute instantly.",
    glow: "from-aura-coral/20 to-aura-violet/25",
  },
  {
    icon: "◎",
    title: "Actionable scorecards",
    desc: "Deterministic 0–10 scores plus structured feedback you can rehearse against.",
    glow: "from-aura-violet/20 to-aura-coral/20",
  },
];

const TRUST_MARKS = ["IIT", "NIT", "SPPU", "VIT", "BITS", "IIIT"];

const CardPattern = () => (
  <div
    className="absolute inset-0 z-0 opacity-[0.35]"
    style={{
      backgroundImage: `radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)`,
      backgroundSize: "44px 44px",
    }}
  />
);

export default function LandingPage() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }));
  }, [location.hash, reduceMotion]);

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
    <div className="relative min-h-screen overflow-x-hidden bg-aura-page text-aura-ink selection:bg-aura-violet/15">
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pb-24 pt-20 text-center sm:pb-32 sm:pt-28"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 720px at var(--mx,50%) var(--my,50%), rgba(255,126,95,0.14), transparent 62%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200/95 bg-white/90 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-lux backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
            Live · Gemini-powered coaching
          </div>

          <h1 className="font-sans text-[2.5rem] font-bold leading-[1.05] tracking-tight text-aura-ink sm:text-5xl md:text-6xl lg:text-[3.5rem]">
            Craft your
            <br />
            <span className="font-display text-[1.08em] font-semibold italic text-gradient sm:text-[1.08em]">
              interview edge
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
            The mock interview stack for candidates who want signal, not scripts — structured AI scoring, camera-aware coaching, and questions grounded in your real experience.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link to={user ? "/dashboard" : "/register"} className="w-full no-underline sm:w-auto">
              <span className="btn-cta w-full justify-center px-10 py-4 text-[15px] shadow-[0_12px_40px_-8px_rgba(157,80,187,0.35)] sm:w-auto">
                {user ? "Go to dashboard" : "Start free"} <span aria-hidden>→</span>
              </span>
            </Link>
            {!user && (
              <Link to="/login" className="w-full no-underline sm:w-auto">
                <span className="btn-secondary w-full justify-center py-4 sm:inline-flex sm:w-auto">Sign in</span>
              </Link>
            )}
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-slate-200/80 pt-10 text-center sm:gap-10">
            {[
              { v: "7", l: "Tailored Qs" },
              { v: "Live", l: "Speech + gaze" },
              { v: "PDF", l: "Export reports" },
            ].map((row) => (
              <div key={row.l}>
                <div className="font-display text-xl font-semibold text-aura-ink sm:text-2xl">{row.v}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">{row.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section
        aria-labelledby="trust-heading"
        className="relative z-10 overflow-hidden border-y border-slate-200/70 bg-gradient-to-b from-[#fff8f5] via-white to-slate-50/80 py-0 backdrop-blur-md"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/90 to-transparent" aria-hidden />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center justify-between gap-4 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <span className="min-w-0 truncate">© {new Date().getFullYear()} all rights reserved</span>
            <span className="shrink-0 tabular-nums text-slate-400">01 — 12</span>
          </div>

          <div className="relative h-px w-full bg-slate-200/80" aria-hidden>
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
          <div className="relative z-[1] -mt-[18px] mb-2 flex justify-center">
            <a
              href="#trusted-marquee"
              className="inline-flex items-center rounded-full border border-slate-200/95 bg-white/95 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-[color,box-shadow,border-color] duration-300 hover:border-slate-300 hover:text-slate-800 hover:shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_32px_-14px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white no-underline"
            >
              Scroll to explore
            </a>
          </div>

          <div id="trusted-marquee" className="scroll-mt-24 pt-6 pb-8 text-center sm:pt-8 sm:pb-10">
            <p
              id="trust-heading"
              className="mb-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 sm:mb-10 sm:text-[10px] sm:tracking-[0.32em]"
            >
              Trusted by students from
            </p>
            <div className="group/marquee relative -mx-5 overflow-hidden sm:-mx-8">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-[#fffdfb] to-transparent sm:w-24"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-slate-50 to-transparent sm:w-24"
                aria-hidden
              />
              <div
                className={
                  reduceMotion
                    ? ""
                    : "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
                }
              >
                {reduceMotion ? (
                  <div className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-3 sm:gap-x-14 md:gap-x-16">
                    {TRUST_MARKS.map((uni) => (
                      <span
                        key={uni}
                        className="select-none font-display text-2xl font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-3xl md:text-[2.125rem] md:tracking-[0.16em]"
                      >
                        {uni}
                      </span>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 28, repeatType: "loop" }}
                    className="flex w-max flex-nowrap items-baseline gap-x-14 gap-y-4 pr-14 sm:gap-x-20 md:gap-x-24"
                  >
                    {[...TRUST_MARKS, ...TRUST_MARKS].map((uni, i) => (
                      <span
                        key={`${uni}-${i}`}
                        className="select-none font-display text-2xl font-semibold uppercase tracking-[0.14em] text-slate-300 transition-colors duration-300 group-hover/marquee:text-slate-400 sm:text-3xl md:text-[2.125rem] md:tracking-[0.16em]"
                      >
                        {uni}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="relative pb-10 pt-2 sm:pb-12">
            <div className="h-px w-full bg-slate-200/80" aria-hidden />
            <div className="relative z-[1] -mt-[18px] flex justify-center">
              <a
                href="#core-architecture"
                className="inline-flex items-center rounded-full border border-slate-200/95 bg-white/95 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-sm transition-[color,border-color,box-shadow] duration-300 hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white no-underline"
              >
                Core architecture
              </a>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      <section
        id="core-architecture"
        className="relative z-10 scroll-mt-24 border-b border-slate-200/80 bg-white/50 py-24 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <div className="section-eyebrow mx-auto mb-4">Core architecture</div>
            <h2 className="text-3xl font-bold tracking-tight text-aura-ink md:text-4xl">
              Powered by{" "}
              <span className="text-gradient font-display italic">four specialized engines</span>
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: "Gemini 1.5 Flash",
                role: "Cognitive engine",
                desc: "Context-aware questions and deterministic JSON grading.",
              },
              {
                title: "MediaPipe Vision",
                role: "Spatial tracking",
                desc: "468 facial landmarks at 30fps for gaze estimation.",
              },
              {
                title: "Web Speech API",
                role: "Neural transcription",
                desc: "Browser-native speech-to-text with minimal latency.",
              },
              {
                title: "Local NLP heuristics",
                role: "Behavioral analytics",
                desc: "WPM and filler detection without round-trips to the server.",
              },
            ].map((engine, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm transition-colors duration-300 hover:border-slate-300"
              >
                <div
                  className={`absolute -inset-px opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${["from-aura-coral/30 to-aura-violet/20", "from-aura-violet/30 to-aura-coral/15", "from-aura-coral/25 to-aura-violet/25", "from-aura-violet/25 to-aura-coral/20"][idx % 4]}`}
                />
                <div className="relative z-10">
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-aura-muted">{engine.role}</p>
                  <h3 className="mb-3 text-lg font-bold tracking-tight text-aura-ink">{engine.title}</h3>
                  <p className="text-sm leading-relaxed text-aura-muted">{engine.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <ComparisonSection />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-28">
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-aura-ink md:text-5xl">
            Everything to <span className="text-gradient font-display italic">land the offer</span>
          </h2>
          <p className="mt-4 text-lg text-aura-muted">No generic banks. Questions grounded in your story.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {features.map((f) => (
            <Tilt key={f.title} glareEnable glareMaxOpacity={0.12} glareColor="#ffffff" glarePosition="all" tiltMaxAngleX={4} tiltMaxAngleY={4}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-md transition-colors duration-300 hover:border-slate-300 md:p-10">
                <CardPattern />
                <div
                  className={`absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br ${f.glow} opacity-0 blur-[56px] transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl text-aura-ink">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-aura-ink">{f.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-aura-muted">{f.desc}</p>
                </div>
              </div>
            </Tilt>
          ))}
        </motion.div>
      </section>

      <PersonasSection />

      <TestimonialsSection />

      <PricingTeaserSection />

      <SecuritySection />

      <FAQSection limit={4} />

      <section className="relative flex justify-center overflow-hidden px-6 py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-aura-coral/15 to-aura-violet/15 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-12 text-center shadow-xl shadow-slate-200/60 backdrop-blur-xl md:p-16">
            <CardPattern />
            <div className="relative z-10">
              <h2 className="mb-5 text-3xl font-bold tracking-tight text-aura-ink md:text-4xl">Ready for your next round?</h2>
              <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-aura-muted md:text-base">
                Replace guesswork with signal. Eye contact, pace, and answer quality — in one flow.
              </p>
              <Link to={user ? "/interview/new" : "/register"} className="no-underline">
                <span className="btn-cta inline-flex px-10 py-3.5 text-[15px]">
                  {user ? "Start new interview" : "Create free account"}{" "}
                  <span className="ml-1" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
