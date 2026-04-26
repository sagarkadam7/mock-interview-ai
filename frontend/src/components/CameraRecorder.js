import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
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
    <div className="text-aura-ink dark:text-slate-100" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={`${label} gauge`} className="text-aura-ink dark:text-slate-100">
        <circle cx="28" cy="28" r={r} className="stroke-slate-200 dark:stroke-slate-600" strokeWidth="5" fill="none" />
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
        <text x="28" y="30.5" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="800">
          {value ?? "—"}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 74 }}>
        <span style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
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

const CameraRecorder = forwardRef(function CameraRecorder(
  {
    onTranscriptChange,
    onRecordingComplete,
    onMLData,
    onRecordingChange,
    disabled,
    /** Hide built-in transcript (e.g. when parent shows it in a main column) */
    showTranscript = true,
    /** "overlay" = metrics on video; "below" = metrics stacked under video (sidebar layout) */
    metricsLayout = "overlay",
  },
  ref
) {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const mediaRecorder = useRef(null);
  const stopRequestedRef = useRef(false);
  const chunks        = useRef([]);
  const recognitionRef= useRef(null);
  const faceMeshRef   = useRef(null);
  const cameraRef     = useRef(null);
  const streamRef     = useRef(null);
  const recordingRef  = useRef(false);
  const lastMlPayloadRef = useRef(null);

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

  useEffect(() => {
    onRecordingChange?.(recording);
  }, [recording, onRecordingChange]);

  // ── Stop + ML (shared by Stop button and parent finalize) ─────
  const performStopRecording = useCallback(() => {
    if (stopRequestedRef.current) {
      return lastMlPayloadRef.current;
    }
    stopRequestedRef.current = true;
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
      const m = lower.match(new RegExp(`\\b${w}\\b`, "gi"));
      if (m) {
        fillerTotal += m.length;
        if (!foundFillers.includes(w)) foundFillers.push(w);
      }
    });

    const words = transcriptRef.current.trim().split(/\s+/).filter(Boolean).length;
    const durationSec = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
    const finalWpm = durationSec > 5 ? Math.round(words / (durationSec / 60)) : 0;

    const confidenceScore = calcConfidenceScore({
      eyeContactPct,
      fillerCount: fillerTotal,
      wpm: finalWpm,
      dominantEmotion: "neutral",
    });

    const payload = {
      eyeContactPct,
      fillerWordCount: fillerTotal,
      fillerWords: foundFillers,
      wordsPerMinute: finalWpm,
      paceLabel: getPaceLabel(finalWpm),
      dominantEmotion: "neutral",
      emotionScores: { neutral: 1, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 },
      confidenceScore,
    };
    lastMlPayloadRef.current = payload;
    onMLData?.(payload);
    onTranscriptChange?.(transcriptRef.current);
    return payload;
  }, [onMLData, onTranscriptChange]);

  useImperativeHandle(
    ref,
    () => ({
      /** Stops the recorder if active; returns latest transcript + ML payload synchronously for submit. */
      finalizeRecording() {
        if (recordingRef.current) {
          performStopRecording();
        }
        return {
          text: transcriptRef.current.trim(),
          mlPayload: lastMlPayloadRef.current,
        };
      },
      isRecording() {
        return recordingRef.current;
      },
    }),
    [performStopRecording]
  );

  // ── Start recording ──────────────────────────────────────────
  const startRecording = () => {
    if (!cameraReady || !streamRef.current) return;
    stopRequestedRef.current = false;
    lastMlPayloadRef.current = null;
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

  const stopRecording = () => {
    if (!recordingRef.current) return;
    performStopRecording();
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
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200/90 bg-zinc-950 shadow-[0_24px_48px_-16px_rgba(15,23,42,0.35),inset_0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-black/5 dark:border-slate-700/90 dark:shadow-[0_28px_56px_-18px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.04]" aria-hidden />
        <video ref={videoRef} autoPlay muted playsInline className="relative z-0 block h-full w-full object-cover" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" />

        {/* Face status */}
        <div
          className={`absolute bottom-3 left-3 z-[2] flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur-xl ${
            faceFound
              ? "border-emerald-500/30 bg-emerald-950/70 text-emerald-300"
              : "border-amber-500/35 bg-black/70 text-amber-200"
          }`}
        >
          <span className={faceFound ? "text-emerald-400" : "text-amber-400"} aria-hidden>
            {faceFound ? "✓" : "⚠"}
          </span>
          {faceFound ? "Face detected" : "No face in frame"}
        </div>

        {/* MediaPipe status */}
        {!mpReady && (
          <div className="absolute bottom-3 right-3 z-[2] rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-amber-200 shadow-lg backdrop-blur-xl">
            Loading vision…
          </div>
        )}
        {mpReady && !recording && (
          <div className="absolute bottom-3 right-3 z-[2] flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/65 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 shadow-lg backdrop-blur-xl">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            Vision ready
          </div>
        )}

        {/* REC badge */}
        {recording && (
          <div className="absolute left-3 top-3 z-[2] flex items-center gap-2 rounded-full border border-rose-500/30 bg-black/80 px-3.5 py-1.5 shadow-lg backdrop-blur-xl">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            <span className="text-xs font-bold tabular-nums tracking-wide text-white">REC {fmt(timer)}</span>
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
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-zinc-950/90 text-sm font-medium text-slate-400">
            <span className="inline-block h-8 w-8 animate-pulse rounded-full border-2 border-slate-600 border-t-violet-400" aria-hidden />
            Starting camera…
          </div>
        )}
      </div>

      {/* Live coaching below video (sidebar layout — no overlap on feed) */}
      {recording && metricsLayout === "below" && (
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white/95 to-slate-50/90 p-4 shadow-lux ring-1 ring-white/70 dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-950/90 dark:ring-slate-800/50">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Live signal</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Streaming
            </span>
          </div>
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/35 dark:bg-rose-950/45 dark:text-rose-100">
          {error}
        </div>
      )}

      {showTranscript && (
        <div>
          <label className="label-field">Live transcript</label>
          <div className="min-h-[72px] rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-sm italic leading-relaxed text-aura-muted">
            {transcript ? renderTranscriptWithFillerHighlights(transcript) : "Start recording and speak — your words will appear here in real time…"}
          </div>
        </div>
      )}

      {!recording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={!cameraReady || disabled}
          className={`group relative w-full overflow-hidden rounded-full py-4 text-[15px] font-bold tracking-tight transition-transform duration-250 ease-out-expo active:scale-[0.98] ${
            !cameraReady || disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              : "text-white shadow-[0_16px_40px_-10px_rgba(91,33,182,0.45),0_0_0_1px_rgba(255,255,255,0.1)_inset] hover:shadow-[0_20px_48px_-10px_rgba(91,33,182,0.55)]"
          }`}
        >
          {cameraReady && !disabled && (
            <>
              <span className="absolute inset-0 bg-gradient-to-br from-aura-coral via-fuchsia-500/90 to-aura-violet" />
              <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-50" />
            </>
          )}
          <span className="relative inline-flex items-center justify-center gap-2.5">
            {cameraReady && !disabled && (
              <svg className="h-5 w-5 shrink-0 opacity-95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="23" />
              </svg>
            )}
            Start recording
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          disabled={disabled}
          className="w-full rounded-full border border-rose-200/90 bg-rose-50 py-4 text-[15px] font-semibold text-rose-900 transition-all duration-250 ease-out-expo hover:border-rose-300 hover:bg-rose-100 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 dark:border-rose-500/35 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-950/70"
        >
          Stop recording (optional)
        </button>
      )}

      {recording && (
        <p className="m-0 text-center text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          Gaze and pace update live. You can tap <span className="font-semibold text-slate-600 dark:text-slate-300">Submit answer</span> anytime — we stop the recorder for you and send this take.
        </p>
      )}
    </div>
  );
});

CameraRecorder.displayName = "CameraRecorder";

export default CameraRecorder;

function Row({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:11, color:"#888888" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, color: color||"#0f172a" }}>{value}</span>
    </div>
  );
}