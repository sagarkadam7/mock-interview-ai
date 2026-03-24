const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text:         { type: String, required: true },
  hint:         { type: String, default: "" },
  answer:       { type: String, default: "" },
  feedback:     { type: String, default: "" },
  strengths:    { type: String, default: "" },
  improvements: { type: String, default: "" },
  score:        { type: Number, default: null, min: 0, max: 10 },
  orderIndex:   { type: Number, required: true },
  answeredAt:   { type: Date, default: null },
  eyeContactPct:   { type: Number, default: null },
  fillerWordCount: { type: Number, default: null },
  fillerWords:     { type: [String], default: [] },
  wordsPerMinute:  { type: Number, default: null },
  paceLabel:       { type: String, default: "" },
  dominantEmotion: { type: String, default: "" },
  emotionScores: {
    neutral:   { type: Number, default: 0 },
    happy:     { type: Number, default: 0 },
    sad:       { type: Number, default: 0 },
    angry:     { type: Number, default: 0 },
    fearful:   { type: Number, default: 0 },
    disgusted: { type: Number, default: 0 },
    surprised: { type: Number, default: 0 },
  },
  confidenceScore: { type: Number, default: null },
});

const interviewSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobRole:      { type: String, required: true, trim: true },
    resumeText:   { type: String, required: true },
    jdText:       { type: String, default: "" },
    status:       { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
    overallScore: { type: Number, default: null },
    avgEyeContact:  { type: Number, default: null },
    avgFillerWords: { type: Number, default: null },
    avgPace:        { type: Number, default: null },
    avgConfidence:  { type: Number, default: null },
    questions: [questionSchema],
  },
  { timestamps: true }
);

interviewSchema.pre("save", function (next) {
  const answered = this.questions.filter((q) => q.score !== null);
  if (answered.length > 0) {
    const total = answered.reduce((s, q) => s + q.score, 0);
    this.overallScore = Math.round((total / answered.length) * 10) / 10;
    const withEye  = answered.filter((q) => q.eyeContactPct !== null);
    const withConf = answered.filter((q) => q.confidenceScore !== null);
    const withPace = answered.filter((q) => q.wordsPerMinute !== null);
    const withFill = answered.filter((q) => q.fillerWordCount !== null);
    if (withEye.length)  this.avgEyeContact  = Math.round(withEye.reduce((s,q)  => s + q.eyeContactPct, 0)   / withEye.length);
    if (withConf.length) this.avgConfidence  = Math.round(withConf.reduce((s,q) => s + q.confidenceScore, 0)  / withConf.length * 10) / 10;
    if (withPace.length) this.avgPace        = Math.round(withPace.reduce((s,q) => s + q.wordsPerMinute, 0)   / withPace.length);
    if (withFill.length) this.avgFillerWords = Math.round(withFill.reduce((s,q) => s + q.fillerWordCount, 0)  / withFill.length * 10) / 10;
  }
  next();
});

module.exports = mongoose.model("Interview", interviewSchema);