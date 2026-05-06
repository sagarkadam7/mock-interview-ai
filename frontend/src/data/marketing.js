/** Shared copy for landing + /faq — single source of truth */

export const FAQ_ITEMS = [
  {
    q: "Which browsers are supported?",
    a: "For the best experience, use Chrome or Edge on desktop. Speech recognition uses the browser’s Web Speech API; Safari support varies. Camera access requires HTTPS in production.",
  },
  {
    q: "Is my resume stored permanently?",
    a: "Resume PDFs are parsed on the server and the file is removed after text extraction. Your interview text and scores live in your account so you can review reports — you can delete sessions anytime from the dashboard.",
  },
  {
    q: "How is my data secured?",
    a: "Passwords are hashed, APIs use JWT authentication, and traffic should be served over HTTPS in production. We don’t sell your data — see our Privacy page for details.",
  },
  {
    q: "Does AI replace a human interviewer?",
    a: "No — it complements practice. You get fast, structured feedback and metrics humans can’t scale, but you should still do real mock interviews with peers or mentors before high-stakes loops.",
  },
  {
    q: "What does “eye contact %” mean?",
    a: "Using MediaPipe face mesh, we estimate whether your gaze is toward the camera over your answer. It’s a heuristic for coaching, not a psychological diagnosis.",
  },
  {
    q: "Can I use this for non-tech roles?",
    a: "Yes. Enter your target role and paste a job description — the model tailors behavioral and situational questions, not only Leetcode-style prompts.",
  },
];

export const HOW_STEPS = [
  {
    n: "01",
    title: "Upload context",
    desc: "Role, optional JD, and resume text or PDF — so questions match what you actually applied for.",
  },
  {
    n: "02",
    title: "Answer on camera",
    desc: "Seven tailored questions with live transcript, pace, fillers, and gaze coaching as you speak.",
  },
  {
    n: "03",
    title: "Get scored feedback",
    desc: "0–10 scores plus strengths and improvements per answer — structured JSON from the model, not vague prose.",
  },
  {
    n: "04",
    title: "Export & iterate",
    desc: "Full PDF report, trend charts on your dashboard, and delete sessions you don’t need.",
  },
];

export const COMPARISON_ROWS = [
  { label: "Questions tied to your resume & JD", us: true, chatbot: false, coach: "Sometimes" },
  { label: "Real-time speech + filler analytics", us: true, chatbot: "Rare", coach: false },
  { label: "Camera presence coaching", us: true, chatbot: false, coach: "Subjective" },
  { label: "Adaptive follow-up questions", us: true, chatbot: "Scripted", coach: true },
  { label: "Deterministic rubric scoring", us: true, chatbot: false, coach: false },
  { label: "Exportable PDF scorecards", us: true, chatbot: "Partial", coach: false },
  { label: "Available 24/7", us: true, chatbot: true, coach: false },
  { label: "Pricing starts at", us: "Free", chatbot: "Freemium", coach: "$120/hr" },
];

export const PERSONAS = [
  {
    title: "Final-year & campus hiring",
    desc: "Structured rounds, tight timelines — rehearse with questions that reference your projects and CGPA story, not generic HR fluff.",
    icon: "◇",
    outcomes: ["Campus-style panels", "Project deep-dives", "Behavioral rubrics"],
    cta: { label: "Start campus prep", to: "/register?track=campus" },
  },
  {
    title: "Career switchers",
    desc: "Paste a JD from a new domain and practice explaining transferable wins with STAR-ready prompts.",
    icon: "◆",
    outcomes: ["Transferable skill framing", "Domain-adaptive questions", "Narrative coaching"],
    cta: { label: "Prep for the switch", to: "/register?track=switcher" },
  },
  {
    title: "Experienced hires",
    desc: "Senior IC or manager tracks — balance technical depth with leadership narratives, scored every time.",
    icon: "◎",
    outcomes: ["Staff-level probes", "Leadership stories", "Executive presence"],
    cta: { label: "Rehearse a senior loop", to: "/register?track=senior" },
  },
];

/** Landing: collaborative note from founders (tabbed on the site) */
export const FOUNDERS_NOTE = {
  eyebrow: "From the team",
  headline: "Practice with signal, not scripts",
  opening:
    "We've all been on both sides of the table—the nervous candidate rehearsing in their head, and the hiring manager hoping for a real spark instead of a polished script. We built this together because interview prep should sharpen who you are, not flatten you into talking points.",
  founders: [
    {
      id: "sagar",
      firstName: "Sagar",
      pillar: "Signal",
      pillarDetail: "Authenticity",
      initials: "SG",
      note:
        "If your answer could belong to anyone in the stack, the room goes quiet—we care about the signal only you can bring, and practice that makes that obvious to you before it is to them.",
    },
    {
      id: "samiksha",
      firstName: "Samiksha",
      pillar: "Live cues",
      pillarDetail: "Speech & gaze",
      initials: "SM",
      note:
        "Words are only part of the story; how you pace yourself and hold the camera matters, and you deserve feedback while the moment still feels real—not only after you watch a recording alone.",
    },
    {
      id: "niranjan",
      firstName: "Niranjan",
      pillar: "Scorecard",
      pillarDetail: "Data-driven growth",
      initials: "NR",
      note:
        "Vague encouragement doesn't compound—we focus on scores and breakdowns you can compare across sessions, so improvement is something you track, not something you hope happened.",
    },
    {
      id: "sampada",
      firstName: "Sampada",
      pillar: "Personalized context",
      pillarDetail: "Résumé & JD",
      initials: "SP",
      note:
        "Generic question banks waste your time; grounding every rep in your résumé and the job description keeps practice honest, specific, and worth repeating.",
    },
  ],
  signOff:
    "We still believe the strongest rounds feel like dialogue, not theater. Thank you for trusting us with your rehearsal—we're in your corner.",
  signOffAttribution: "Sagar, Samiksha, Niranjan, and Sampada",
};

export const TESTIMONIALS = [
  {
    quote:
      "The feedback isn’t just ‘good job’ — it’s specific enough that I changed how I structure answers. The PDF report is perfect to review the night before onsite.",
    name: "Priya K.",
    role: "CS · Class of 2025",
  },
  {
    quote:
      "Seeing filler count and pace next to the score made me aware of habits I couldn’t hear myself. Way more useful than recording in Voice Memos.",
    name: "Rahul M.",
    role: "SWE intern → return offer",
  },
  {
    quote:
      "Questions actually referenced my internship stack. Felt closer to a real panel than random Glassdoor lists.",
    name: "Ananya S.",
    role: "Product internship loop",
  },
];
