import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const FILLER_WORDS = [
  "um","uh","like","basically","literally","actually",
  "you know","i mean","so","right","okay","hmm","er","ah"
];

const FILLER_WORD_SET = new Set(FILLER_WORDS.map((w) => w.toLowerCase()));
const FILLER_WORD_REGEX = new RegExp(`\\b(${FILLER_WORDS.join("|")})\\b`, "gi");

const LEFT_IRIS  = [474, 475, 476, 477];
const RIGHT_IRIS = [469, 470, 471, 472];
const LEFT_EYE   = [33, 133];
const RIGHT_EYE  = [362, 263];
const NOSE_TIP   = 1;

function getPaceLabel(wpm) {
  if (!wpm || wpm === 0) return "—";
  if (wpm < 100) return "too slow";
  if (wpm > 180) return "too fast";
  return "good";
}

function calcConfidenceScore({ eyeContactPct, fillerCount, wpm, dominantEmotion }) {
  let score = 10;
  if (eyeContactPct !== null) score -= (1 - eyeContactPct / 100) * 3;
  score -= Math.min(fillerCount * 0.3, 2);
  if (wpm > 0) {
    if (wpm < 80 || wpm > 200) score -= 1.5;
    else if (wpm < 100 || wpm > 180) score -= 0.5;
  }
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

function isLookingAtCamera(landmarks) {
  try {
    const lx = (landmarks[LEFT_EYE[0]].x  + landmarks[LEFT_EYE[1]].x)  / 2;
    const rx = (landmarks[RIGHT_EYE[0]].x + landmarks[RIGHT_EYE[1]].x) / 2;
    const eyeCenterX  = (lx + rx) / 2;
    const lirisX      = landmarks[LEFT_IRIS[0]].x;
    const ririsX      = landmarks[RIGHT_IRIS[0]].x;
    const irisCenterX = (lirisX + ririsX) / 2;
    const noseTipX    = landmarks[NOSE_TIP].x;
    const faceWidth   = Math.abs(landmarks[LEFT_EYE[0]].x - landmarks[RIGHT_EYE[1]].x);
    const irisDeviation = Math.abs(irisCenterX - eyeCenterX) / (faceWidth + 0.001);
    const headYaw       = Math.abs(noseTipX - eyeCenterX)   / (faceWidth + 0.001);
    return irisDeviation < 0.15 && headYaw < 0.25;
  } catch {
    return true;
  }
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function Dial({ label, value, pct, color }) {
  const size = 56;
  const r = 18;
  const c = 2 * Math.PI * r;
  const progress = clamp01(pct ?? 0);
  const dashOffset = c * (1 - progress);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={`${label} gauge`}>
        <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.10)" strokeWidth="5" fill="none" />
        <circle
          cx="28"
          cy="28"
          r={r}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.35s ease" }}
        />
        <text x="28" y="30.5" textAnchor="middle" fontSize="11" fill="#e8eaf0" fontWeight="800">
          {value ?? "—"}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 74 }}>
        <span style={{ fontSize: 11, color: "#9097b0", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: color }}>{typeof value === "number" && !Number.isNaN(value) ? value : value}</span>
      </div>
    </div>
  );
}

export function renderTranscriptWithFillerHighlights(text) {
  if (!text) return null;
  const parts = text.split(FILLER_WORD_REGEX);
  return parts.map((part, idx) => {
    const lower = String(part).toLowerCase();
    const isFiller = FILLER_WORD_SET.has(lower);
    if (!part) return <span key={idx} />;
    if (isFiller) {
      return (
        <span
          key={idx}
          style={{
            background: "rgba(244,63,94,0.16)",
            border: "1px solid rgba(244,63,94,0.28)",
            color: "#fca5a5",
            padding: "1px 6px",
            borderRadius: 999,
            fontStyle: "normal",
            fontWeight: 700,
            margin: "0 1px",
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function CameraRecorder({
  onTranscriptChange,
  onRecordingComplete,
  onMLData,
  disabled,
  /** Hide built-in transcript (e.g. when parent shows it in a main column) */
  showTranscript = true,
  /** "overlay" = metrics on video; "below" = metrics stacked under video (sidebar layout) */
  metricsLayout = "overlay",
}) {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks        = useRef([]);
  const recognitionRef= useRef(null);
  const faceMeshRef   = useRef(null);
  const cameraRef     = useRef(null);
  const streamRef     = useRef(null);
  const recordingRef  = useRef(false);

  const [recording,   setRecording]   = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [mpReady,     setMpReady]     = useState(false);
  const [error,       setError]       = useState("");
  const [timer,       setTimer]       = useState(0);
  const timerRef = useRef(null);

  const [eyePct,      setEyePct]      = useState(null);
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm,         setWpm]         = useState(0);
  const [faceFound,   setFaceFound]   = useState(false);

  const eyeFrames    = useRef([]);
  const startTimeRef = useRef(null);
  const transcriptRef= useRef("");

  // ── Init camera ─────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width:640, height:480, facingMode:"user" }, audio:true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch(() => setError("Camera access denied. Allow camera permissions and refresh."));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cameraRef.current?.stop();
    };
  }, []);

  // ── Init MediaPipe ───────────────────────────────────────────
  useEffect(() => {
    if (!cameraReady || !videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces:            1,
      refineLandmarks:        true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const video  = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks?.length > 0) {
        setFaceFound(true);
        const lm = results.multiFaceLandmarks[0];

        // Draw nose dot
        ctx.beginPath();
        ctx.arc(lm[NOSE_TIP].x * canvas.width, lm[NOSE_TIP].y * canvas.height, 3, 0, 2*Math.PI);
        ctx.fillStyle = "rgba(108,99,255,0.8)";
        ctx.fill();

        // Draw iris dots
        [...LEFT_IRIS, ...RIGHT_IRIS].forEach((idx) => {
          ctx.beginPath();
          ctx.arc(lm[idx].x * canvas.width, lm[idx].y * canvas.height, 2, 0, 2*Math.PI);
          ctx.fillStyle = "rgba(34,197,94,0.9)";
          ctx.fill();
        });

        if (recordingRef.current) {
          const looking = isLookingAtCamera(lm);
          eyeFrames.current.push(looking ? 1 : 0);
          const pct = Math.round(
            (eyeFrames.current.filter(Boolean).length / eyeFrames.current.length) * 100
          );
          setEyePct(pct);
        }
      } else {
        setFaceFound(false);
        if (recordingRef.current) eyeFrames.current.push(0);
      }
    });

    faceMeshRef.current = faceMesh;

    const mpCam = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
      },
      width: 640, height: 480,
    });

    mpCam.start()
      .then(() => { setMpReady(true); console.log("✅ MediaPipe ready"); })
      .catch((e) => { console.warn("MediaPipe error:", e); setMpReady(true); });

    cameraRef.current = mpCam;

    return () => { mpCam.stop(); faceMesh.close(); };
  }, [cameraReady]);

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (recording) timerRef.current = setInterval(() => setTimer((t) => t+1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const fmt = (s) =>
    `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── Filler + WPM from transcript ─────────────────────────────
  useEffect(() => {
    transcriptRef.current = transcript;
    const lower = transcript.toLowerCase();
    let count = 0;
    FILLER_WORDS.forEach((w) => {
      const m = lower.match(new RegExp(`\\b${w}\\b`,"gi"));
      if (m) count += m.length;
    });
    setFillerCount(count);
    if (startTimeRef.current && timer > 2) {
      const words = transcript.trim().split(/\s+/).filter(Boolean).length;
      setWpm(Math.round(words / (timer / 60)));
    }
  }, [transcript, timer]);

  // ── Start recording ──────────────────────────────────────────
  const startRecording = () => {
    if (!cameraReady || !streamRef.current) return;
    chunks.current       = [];
    eyeFrames.current    = [];
    startTimeRef.current = Date.now();
    recordingRef.current = true;

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9" : "video/webm",
    });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type:"video/webm" });
      onRecordingComplete?.(blob);
    };
    recorder.start(200);
    mediaRecorder.current = recorder;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "en-US";
      let final = "";
      r.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
          else interim = e.results[i][0].transcript;
        }
        const full = final + interim;
        setTranscript(full);
        onTranscriptChange?.(full);
      };
      r.onerror = (e) => { if (e.error !== "no-speech") console.warn("Speech:", e.error); };
      r.start();
      recognitionRef.current = r;
    }

    setRecording(true);
    setTimer(0);
  };

  // ── Stop recording + collect ML data ─────────────────────────
  const stopRecording = () => {
    recordingRef.current = false;
    mediaRecorder.current?.stop();
    recognitionRef.current?.stop();
    setRecording(false);

    const eyeContactPct = eyeFrames.current.length > 0
      ? Math.round((eyeFrames.current.filter(Boolean).length / eyeFrames.current.length) * 100)
      : null;

    const lower = transcriptRef.current.toLowerCase();
    let fillerTotal = 0;
    const foundFillers = [];
    FILLER_WORDS.forEach((w) => {
      const m = lower.match(new RegExp(`\\b${w}\\b`,"gi"));
      if (m) { fillerTotal += m.length; if (!foundFillers.includes(w)) foundFillers.push(w); }
    });

    const words       = transcriptRef.current.trim().split(/\s+/).filter(Boolean).length;
    const durationSec = (Date.now() - startTimeRef.current) / 1000;
    const finalWpm    = durationSec > 5 ? Math.round(words / (durationSec / 60)) : 0;

    const confidenceScore = calcConfidenceScore({
      eyeContactPct, fillerCount: fillerTotal, wpm: finalWpm, dominantEmotion: "neutral",
    });

    onMLData?.({
      eyeContactPct,
      fillerWordCount: fillerTotal,
      fillerWords:     foundFillers,
      wordsPerMinute:  finalWpm,
      paceLabel:       getPaceLabel(finalWpm),
      dominantEmotion: "neutral",
      emotionScores:   { neutral:1, happy:0, sad:0, angry:0, fearful:0, disgusted:0, surprised:0 },
      confidenceScore,
    });
  };

  const eyeColor    = eyePct === null ? "#888" : eyePct > 70 ? "#22c55e" : eyePct > 40 ? "#f59e0b" : "#ef4444";
  const fillerColor = fillerCount > 5 ? "#ef4444" : fillerCount > 2 ? "#f59e0b" : "#22c55e";
  const wpmColor    = wpm === 0 ? "#888" : wpm >= 100 && wpm <= 180 ? "#22c55e" : "#f59e0b";

  const pacePct = wpm > 0 ? clamp01(1 - Math.abs(wpm - 150) / 120) : null;
  const fillerPct = fillerCount > 0 ? clamp01(1 - fillerCount / 10) : 1;
  const confidencePreview = transcript.trim() ? calcConfidenceScore({ eyeContactPct: eyePct, fillerCount, wpm, dominantEmotion: "neutral" }) : null;
  const confidencePct = confidencePreview !== null ? clamp01(confidencePreview / 10) : null;
  const confidenceColor = confidencePreview === null ? "#888" : confidencePreview >= 7 ? "#22c55e" : confidencePreview >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col gap-4">

      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-glass">
        <video ref={videoRef} autoPlay muted playsInline className="block h-full w-full object-cover" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* Face status */}
        <div className={`absolute bottom-3 left-3 rounded-lg px-2.5 py-1 text-[11px] font-medium backdrop-blur-md ${faceFound ? "bg-black/60 text-emerald-400" : "bg-black/60 text-amber-400"}`}>
          {faceFound ? "✓ Face detected" : "⚠ No face detected"}
        </div>

        {/* MediaPipe status */}
        {!mpReady && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] text-amber-400 backdrop-blur-md">
            ⏳ Loading MediaPipe…
          </div>
        )}
        {mpReady && !recording && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] text-emerald-400 backdrop-blur-md">
            ✓ MediaPipe ready
          </div>
        )}

        {/* REC badge */}
        {recording && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/75 px-3.5 py-1.5 backdrop-blur-md">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            <span className="text-xs font-semibold text-white">REC {fmt(timer)}</span>
          </div>
        )}

        {/* Live ML overlay (default) — hidden in sidebar "below" layout */}
        {recording && metricsLayout === "overlay" && (
          <div className="absolute right-3 top-3 min-w-[248px] rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur-md">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-aura-muted">Live coaching</div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Dial
                  label="Eye"
                  value={eyePct !== null ? `${eyePct}%` : "—"}
                  pct={eyePct !== null ? eyePct / 100 : 0}
                  color={eyeColor}
                />
              </div>
              <div>
                <Dial
                  label="Fillers"
                  value={String(fillerCount)}
                  pct={fillerPct}
                  color={fillerColor}
                />
              </div>
              <div className="col-span-2">
                <Dial
                  label="Pace"
                  value={wpm > 0 ? `${wpm}` : "—"}
                  pct={pacePct}
                  color={wpmColor}
                />
              </div>
              <div className="col-span-2">
                <Dial
                  label="Confidence"
                  value={confidencePreview !== null ? `${confidencePreview.toFixed(1)}` : "—"}
                  pct={confidencePct}
                  color={confidenceColor}
                />
              </div>
            </div>
          </div>
        )}

        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-sm text-aura-muted">
            Starting camera…
          </div>
        )}
      </div>

      {/* Live coaching below video (sidebar layout — no overlap on feed) */}
      {recording && metricsLayout === "below" && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-aura-muted">Live coaching</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dial
              label="Eye"
              value={eyePct !== null ? `${eyePct}%` : "—"}
              pct={eyePct !== null ? eyePct / 100 : 0}
              color={eyeColor}
            />
            <Dial
              label="Fillers"
              value={String(fillerCount)}
              pct={fillerPct}
              color={fillerColor}
            />
            <div className="sm:col-span-2">
              <Dial
                label="Pace"
                value={wpm > 0 ? `${wpm}` : "—"}
                pct={pacePct}
                color={wpmColor}
              />
            </div>
            <div className="sm:col-span-2">
              <Dial
                label="Confidence"
                value={confidencePreview !== null ? `${confidencePreview.toFixed(1)}` : "—"}
                pct={confidencePct}
                color={confidenceColor}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {showTranscript && (
        <div>
          <label className="label-field">Live transcript</label>
          <div className="min-h-[72px] rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm italic leading-relaxed text-aura-muted">
            {transcript ? renderTranscriptWithFillerHighlights(transcript) : "Start recording and speak — your words will appear here in real time…"}
          </div>
        </div>
      )}

      {!recording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={!cameraReady || disabled}
          className={`w-full rounded-full py-3.5 text-[15px] font-bold transition-all duration-300 ${
            !cameraReady || disabled
              ? "cursor-not-allowed bg-white/5 text-aura-muted"
              : "border-0 bg-gradient-to-r from-aura-coral to-aura-violet text-white shadow-lg shadow-aura-violet/25 hover:scale-[1.01]"
          }`}
        >
          🎙 Start Recording
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="w-full rounded-xl border border-rose-500/35 bg-rose-500/10 py-3.5 text-[15px] font-medium text-rose-300 transition-all duration-300 hover:border-rose-400/50 hover:bg-rose-500/20"
        >
          ⏹ Stop Recording
        </button>
      )}

      {recording && (
        <p className="m-0 text-center text-xs text-aura-muted">
          MediaPipe is tracking your iris for eye contact. Speak naturally!
        </p>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:11, color:"#888888" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, color: color||"#ffffff" }}>{value}</span>
    </div>
  );
}