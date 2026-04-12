import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

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

const CardPattern = () => (
  <div
    className="absolute inset-0 z-0 opacity-[0.04]"
    style={{
      backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)`,
      backgroundSize: "44px 44px",
    }}
  />
);

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
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-aura-violet/25">
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 pb-28 pt-24 text-center sm:pb-32"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 720px at var(--mx,50%) var(--my,50%), rgba(255,126,95,0.08), transparent 65%)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="mb-8 inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-white">
            New release · Practice stack v1
          </div>

          <h1 className="font-sans text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.35rem]">
            Craft your
            <br />
            <span className="font-display text-[1.12em] font-semibold italic text-gradient sm:text-[1.08em]">
              interview edge
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-aura-muted sm:text-base">
            The first mock interview stack built for serious candidates. Structured feedback, camera analytics, and
            questions grounded in your real resume.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={user ? "/dashboard" : "/register"} className="w-full no-underline sm:w-auto">
              <span className="btn-cta w-full justify-center px-10 py-3.5 text-[15px] sm:w-auto">
                Get early access <span aria-hidden>→</span>
              </span>
            </Link>
            {!user && (
              <Link to="/login" className="w-full no-underline sm:w-auto">
                <button
                  type="button"
                  className="w-full rounded-full border border-white/15 bg-transparent px-8 py-3.5 text-[15px] font-semibold text-aura-muted transition-colors hover:border-white/25 hover:text-white sm:w-auto"
                >
                  Sign in
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-6 left-6 hidden text-[10px] font-semibold uppercase tracking-aura text-aura-muted sm:block">
          © {new Date().getFullYear()} all rights reserved
        </div>
        <div className="pointer-events-none absolute bottom-6 right-6 hidden text-[10px] font-semibold uppercase tracking-aura text-aura-muted sm:block">
          01 of 12
        </div>
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 rounded-t-lg border border-b-0 border-white/10 bg-zinc-950/90 px-5 py-2 backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-aura-muted">Scroll to explore</p>
        </div>
      </section>

      <section className="border-y border-white/[0.06] py-10">
        <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-aura text-aura-muted">
          Trusted by students from
        </p>
        <div className="relative mx-auto flex max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 22 }}
            className="flex flex-nowrap items-center gap-16 pr-16 text-lg font-bold uppercase tracking-aura text-white/15 sm:text-xl"
          >
            {["IIT", "NIT", "SPPU", "VIT", "BITS", "IIIT", "IIT", "NIT", "SPPU", "VIT", "BITS", "IIIT"].map((uni, i) => (
              <span key={i} className="transition-colors hover:text-white/25">
                {uni}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/[0.06] bg-black/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <div className="section-eyebrow mx-auto mb-4">Core architecture</div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
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
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-6 transition-colors duration-300 hover:border-white/15"
              >
                <div
                  className={`absolute -inset-px opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${["from-aura-coral/30 to-aura-violet/20", "from-aura-violet/30 to-aura-coral/15", "from-aura-coral/25 to-aura-violet/25", "from-aura-violet/25 to-aura-coral/20"][idx % 4]}`}
                />
                <div className="relative z-10">
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-aura-muted">{engine.role}</p>
                  <h3 className="mb-3 text-lg font-bold tracking-tight text-white">{engine.title}</h3>
                  <p className="text-sm leading-relaxed text-aura-muted">{engine.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-28">
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
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
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.1] bg-zinc-950/50 p-8 transition-colors duration-300 hover:border-white/18 md:p-10">
                <CardPattern />
                <div
                  className={`absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br ${f.glow} opacity-0 blur-[56px] transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl text-white">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{f.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-aura-muted">{f.desc}</p>
                </div>
              </div>
            </Tilt>
          ))}
        </motion.div>
      </section>

      <section className="relative flex justify-center overflow-hidden px-6 py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-aura-coral/15 to-aura-violet/15 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-zinc-950/70 p-12 text-center shadow-enterprise backdrop-blur-xl md:p-16">
            <CardPattern />
            <div className="relative z-10">
              <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl">Ready for your next round?</h2>
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

      <footer className="border-t border-white/[0.06] py-8 text-center text-[10px] font-semibold uppercase tracking-aura text-aura-muted sm:hidden">
        © {new Date().getFullYear()} all rights reserved
      </footer>
    </div>
  );
}
