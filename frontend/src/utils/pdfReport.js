import jsPDF from "jspdf";
import { buildNextRepsFromInterview } from "./practiceSignals";

export function generatePDFReport(interview) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const page = { w: 210, margin: 16, footerY: 282 };
  const contentW = page.w - page.margin * 2;
  const colors = {
    ink: [15, 23, 42],
    muted: [100, 116, 139],
    faint: [226, 232, 240],
    violet: [91, 33, 182],
    coral: [232, 85, 71],
    emerald: [5, 150, 105],
    amber: [217, 119, 6],
    rose: [225, 29, 72],
  };

  let y = page.margin;

  const clean = (value, fallback = "") =>
    String(value ?? fallback)
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/…/g, "...")
      .replace(/[•·]/g, "-")
      .replace(/[^\x20-\x7E\n]/g, "")
      .replace(/[ \t]+/g, " ")
      .trim();

  const setText = (size = 10, color = colors.ink, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
  };

  const textLines = (text, width) => doc.splitTextToSize(clean(text), width);
  const lineHeight = (size) => Math.max(size * 0.42, 4.2);

  const ensureSpace = (height) => {
    if (y + height <= page.footerY - 4) return;
    doc.addPage();
    y = page.margin;
  };

  const addText = (
    text,
    { x = page.margin, width = contentW, size = 10, color = colors.ink, bold = false, after = 2 } = {}
  ) => {
    const lines = textLines(text, width);
    const lh = lineHeight(size);
    ensureSpace(lines.length * lh + after);
    setText(size, color, bold);
    doc.text(lines, x, y);
    y += lines.length * lh + after;
    return lines.length * lh + after;
  };

  const drawCard = (x, top, width, height, fill = [255, 255, 255], border = colors.faint) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, top, width, height, 3, 3, "FD");
  };

  const scoreTone = (score) => {
    if (typeof score !== "number") return colors.muted;
    if (score >= 7) return colors.emerald;
    if (score >= 4) return colors.amber;
    return colors.rose;
  };

  const truncate = (text, limit) => {
    const value = clean(text);
    return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
  };

  const date = interview.createdAt
    ? new Date(interview.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";
  const questions = Array.isArray(interview.questions) ? interview.questions : [];
  const answered = questions.filter((q) => q.score !== null).length;
  const overall = typeof interview.overallScore === "number" ? interview.overallScore : null;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, page.w, 54, "F");
  doc.setFillColor(...colors.violet);
  doc.rect(0, 0, 5, 54, "F");
  doc.setFillColor(...colors.coral);
  doc.rect(5, 0, 2, 54, "F");

  y = 17;
  addText("AI Mock Interview Report", { x: page.margin, width: 120, size: 20, bold: true, after: 3 });
  addText(clean(interview.jobRole, "Interview session"), {
    x: page.margin,
    width: 128,
    size: 12,
    color: colors.muted,
    after: 2,
  });
  addText(`${date} - ${answered}/${questions.length} questions answered`, {
    x: page.margin,
    width: 128,
    size: 9,
    color: colors.muted,
    after: 0,
  });

  drawCard(156, 15, 36, 26, [255, 255, 255], [221, 214, 254]);
  setText(8, colors.muted, true);
  doc.text("OVERALL", 174, 23, { align: "center" });
  setText(20, scoreTone(overall), true);
  doc.text(overall !== null ? `${overall}/10` : "N/A", 174, 35, { align: "center" });

  y = 66;
  const metricGap = 4;
  const metricW = (contentW - metricGap * 3) / 4;
  const metrics = [
    ["Eye contact", interview.avgEyeContact !== null ? `${interview.avgEyeContact}%` : "N/A"],
    ["Confidence", interview.avgConfidence !== null ? `${interview.avgConfidence}/10` : "N/A"],
    ["Speech pace", interview.avgPace ? `${interview.avgPace} wpm` : "N/A"],
    ["Fillers / Q", interview.avgFillerWords !== null ? `${interview.avgFillerWords}` : "N/A"],
  ];
  metrics.forEach(([label, value], i) => {
    const x = page.margin + i * (metricW + metricGap);
    drawCard(x, y, metricW, 24, [255, 255, 255], colors.faint);
    setText(7, colors.muted, true);
    doc.text(label.toUpperCase(), x + 4, y + 8);
    setText(13, colors.ink, true);
    doc.text(clean(value), x + 4, y + 17);
  });
  y += 36;

  addText("Next reps", { size: 14, bold: true, after: 1 });
  addText("Three focused actions before your next session.", { size: 9, color: colors.muted, after: 4 });
  const reps = buildNextRepsFromInterview(interview);
  reps.forEach((line, i) => {
    const lines = textLines(`${i + 1}. ${line}`, contentW - 10);
    const h = Math.max(12, lines.length * 4.6 + 7);
    ensureSpace(h + 3);
    const top = y;
    drawCard(page.margin, top, contentW, h, [248, 250, 252], colors.faint);
    setText(9, colors.ink, false);
    doc.text(lines, page.margin + 5, top + 7);
    y = top + h + 3;
  });

  y += 5;
  addText("Question breakdown", { size: 14, bold: true, after: 5 });

  questions.forEach((q, i) => {
    const qText = truncate(q.text, 420);
    const answer = q.answer ? truncate(q.answer, 520) : "";
    const feedback = q.feedback ? truncate(q.feedback, 560) : "";
    const strengths = q.strengths ? truncate(q.strengths, 280) : "";
    const improvements = q.improvements ? truncate(q.improvements, 280) : "";
    const signals = [];

    if (q.questionType === "follow_up") signals.push("Adaptive follow-up");
    if (typeof q.eyeContactPct === "number") signals.push(`Eye ${q.eyeContactPct}%`);
    if (typeof q.wordsPerMinute === "number" && q.wordsPerMinute > 0)
      signals.push(`Pace ${q.wordsPerMinute} wpm`);
    if (typeof q.fillerWordCount === "number") signals.push(`Fillers ${q.fillerWordCount}`);
    if (typeof q.confidenceScore === "number") signals.push(`Confidence ${q.confidenceScore}/10`);

    const qLines = textLines(qText, contentW - 42);
    const signalLines = signals.length ? textLines(signals.join("  |  "), contentW - 22) : [];
    const answerLines = answer ? textLines(answer, contentW - 22) : [];
    const feedbackLines = feedback ? textLines(feedback, contentW - 22) : [];
    const strengthsLines = strengths ? textLines(strengths, contentW / 2 - 17) : [];
    const improvementsLines = improvements ? textLines(improvements, contentW / 2 - 17) : [];
    const twoColH =
      Math.max(strengthsLines.length, improvementsLines.length) * 4.3 + (strengths || improvements ? 12 : 0);
    const h =
      16 +
      qLines.length * 4.6 +
      signalLines.length * 4.2 +
      answerLines.length * 4.3 +
      feedbackLines.length * 4.3 +
      twoColH +
      18;

    ensureSpace(h + 6);
    const top = y;
    drawCard(page.margin, top, contentW, h, [255, 255, 255], colors.faint);
    doc.setFillColor(...scoreTone(q.score));
    doc.roundedRect(page.margin, top, 3, h, 2, 2, "F");

    setText(8, colors.muted, true);
    doc.text(`Q${i + 1}`, page.margin + 8, top + 8);
    setText(11, colors.ink, true);
    doc.text(qLines, page.margin + 8, top + 15);

    setText(13, scoreTone(q.score), true);
    doc.text(q.score !== null ? `${q.score}/10` : "N/A", page.w - page.margin - 8, top + 9, {
      align: "right",
    });

    let innerY = top + 17 + qLines.length * 4.6;
    if (signalLines.length) {
      setText(8, colors.muted, false);
      doc.text(signalLines, page.margin + 8, innerY);
      innerY += signalLines.length * 4.2 + 4;
    }

    if (answerLines.length) {
      setText(8, colors.muted, true);
      doc.text("YOUR ANSWER", page.margin + 8, innerY);
      innerY += 5;
      setText(9, colors.ink, false);
      doc.text(answerLines, page.margin + 8, innerY);
      innerY += answerLines.length * 4.3 + 4;
    }

    if (feedbackLines.length) {
      setText(8, colors.violet, true);
      doc.text("AI FEEDBACK", page.margin + 8, innerY);
      innerY += 5;
      setText(9, colors.ink, false);
      doc.text(feedbackLines, page.margin + 8, innerY);
      innerY += feedbackLines.length * 4.3 + 5;
    }

    if (strengths || improvements) {
      const colW = contentW / 2 - 6;
      const leftX = page.margin + 8;
      const rightX = page.margin + 8 + colW + 6;
      setText(8, colors.emerald, true);
      doc.text("STRENGTHS", leftX, innerY);
      setText(8, colors.amber, true);
      doc.text("IMPROVEMENTS", rightX, innerY);
      setText(8.5, colors.ink, false);
      if (strengthsLines.length) doc.text(strengthsLines, leftX, innerY + 5);
      if (improvementsLines.length) doc.text(improvementsLines, rightX, innerY + 5);
    }

    y = top + h + 6;
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...colors.faint);
    doc.line(page.margin, page.footerY, page.w - page.margin, page.footerY);
    setText(8, colors.muted, false);
    doc.text(
      "Generated by AI Mock Interview Platform - For practice purposes only",
      page.margin,
      page.footerY + 6
    );
    doc.text(`Page ${i} of ${pageCount}`, page.w - page.margin, page.footerY + 6, { align: "right" });
  }

  const safeRole = clean(interview.jobRole, "interview")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "");
  doc.save(`interview-report-${safeRole || "interview"}.pdf`);
}
