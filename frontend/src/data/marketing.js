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
  { label: "Questions tied to your resume", us: true, them: false },
  { label: "Live speech + filler analytics", us: true, them: "Rare" },
  { label: "Camera / gaze coaching", us: true, them: false },
  { label: "Per-answer AI scores + PDF", us: true, them: "Partial" },
  { label: "Works in the browser (no install)", us: true, them: true },
];

export const PERSONAS = [
  {
    title: "Final-year & campus hiring",
    desc: "Structured rounds, tight timelines — rehearse with questions that reference your projects and CGPA story, not generic HR fluff.",
    icon: "◇",
  },
  {
    title: "Career switchers",
    desc: "Paste a JD from a new domain and practice explaining transferable wins with STAR-ready prompts.",
    icon: "◆",
  },
  {
    title: "Experienced hires",
    desc: "Senior IC or manager tracks — balance technical depth with leadership narratives, scored every time.",
    icon: "◎",
  },
];

/** Landing: editorial note from founder (Sagar Kadam) */
export const FOUNDER_LETTER = {
  eyebrow: "Founder's note",
  headline: "Practice with signal, not scripts",
  lead:
    "The strongest candidates I know do not cram answers — they learn how they sound and look when the stakes are real.",
  paragraphs: [
    "Mock Interview AI came from watching friends grind random question lists while their real stories sat untouched on the page. I wanted a tool that respects your résumé and the job description you paste in: something that feels closer to a sharp mock than a skim through a chatbot.",
    "We paired Gemini with live speech and gaze cues so you get specificity and self-awareness in one sitting — where you ramble, where you look away, and where your answers land on a scorecard you can iterate on, not vague encouragement.",
    "If this helps you walk into your next round calmer and more deliberate, that is why I built it. Thank you for trusting us with your practice.",
  ],
  asideQuote: "Your next round deserves rehearsal that respects your story.",
  name: "Sagar Kadam",
  role: "Founder",
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
