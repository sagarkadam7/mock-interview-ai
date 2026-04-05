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

function renderTranscriptWithFillerHighlights(text) {
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
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      <div style={{ position:"relative", background:"#000", borderRadius:12, overflow:"hidden", aspectRatio:"16/9" }}>
        <video ref={videoRef} autoPlay muted playsInline
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        <canvas ref={canvasRef}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />

        {/* Face status */}
        <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(0,0,0,0.65)", borderRadius:8, padding:"4px 10px", fontSize:11, color: faceFound ? "#22c55e" : "#f59e0b" }}>
          {faceFound ? "✓ Face detected" : "⚠ No face detected"}
        </div>

        {/* MediaPipe status */}
        {!mpReady && (
          <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.65)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#f59e0b" }}>
            ⏳ Loading MediaPipe…
          </div>
        )}
        {mpReady && !recording && (
          <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.65)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#22c55e" }}>
            ✓ MediaPipe ready
          </div>
        )}

        {/* REC badge */}
        {recording && (
          <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.72)", borderRadius:99, padding:"5px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", display:"inline-block", animation:"pulse 1s ease-in-out infinite" }} />
            <span style={{ fontSize:12, color:"#fff", fontWeight:600 }}>REC {fmt(timer)}</span>
          </div>
        )}

        {/* Live ML overlay */}
        {recording && (
          <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.80)", borderRadius:10, padding:"10px 12px", minWidth:248 }}>
            <div style={{ fontSize:10, color:"#9097b0", marginBottom:8, letterSpacing:"0.06em", textTransform:"uppercase" }}>Live coaching</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
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
              <div style={{ gridColumn: "1 / -1" }}>
                <Dial
                  label="Pace"
                  value={wpm > 0 ? `${wpm}` : "—"}
                  pct={pacePct}
                  color={wpmColor}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
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
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#000", color:"#9097b0", fontSize:14 }}>
            Starting camera…
          </div>
        )}
      </div>

      {error && (
        <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", fontSize:14, color:"#fca5a5" }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display:"block", fontSize:12, fontWeight:500, color:"#9097b0", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>Live transcript</label>
        <div style={{ background:"#1a1d28", border:"1px solid #2a2d3a", borderRadius:10, padding:14, minHeight:72, fontSize:14, color:"#9097b0", fontStyle:"italic", lineHeight:1.7 }}>
          {transcript ? renderTranscriptWithFillerHighlights(transcript) : "Start recording and speak — your words will appear here in real time…"}
        </div>
      </div>

      {!recording ? (
        <button onClick={startRecording} disabled={!cameraReady || disabled}
          style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:(!cameraReady||disabled) ? "#2a2d3a" : "#6c63ff", color:(!cameraReady||disabled) ? "#5d6480" : "#fff", fontSize:15, fontWeight:500, cursor:(!cameraReady||disabled) ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
          🎙 Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}
          style={{ width:"100%", padding:13, borderRadius:10, border:"1px solid rgba(239,68,68,0.35)", background:"rgba(239,68,68,0.15)", color:"#ef4444", fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
          ⏹ Stop Recording
        </button>
      )}

      {recording && (
        <p style={{ fontSize:12, color:"#5d6480", textAlign:"center", margin:0 }}>
          MediaPipe is tracking your iris for eye contact. Speak naturally!
        </p>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:11, color:"#9097b0" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, color: color||"#e8eaf0" }}>{value}</span>
    </div>
  );
}