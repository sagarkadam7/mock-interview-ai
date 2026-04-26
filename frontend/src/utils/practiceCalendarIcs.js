/**
 * Download a minimal .ics so candidates can block focus time for the next rep.
 * @param {{ title?: string, minutes?: number, hoursFromNow?: number }} [opts]
 */
export function downloadPracticeBlockIcs(opts = {}) {
  const title = (opts.title || "InterviewAI — practice block").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;");
  const minutes = Math.max(15, Math.min(180, Number(opts.minutes) || 45));
  const hoursFromNow = Math.max(0.25, Math.min(168, Number(opts.hoursFromNow) || 2));

  const start = new Date(Date.now() + hoursFromNow * 3600000);
  const end = new Date(start.getTime() + minutes * 60000);

  const stamp = (d) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(
      d.getUTCHours()
    ).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}Z`;

  const uid = `interviewai-${Date.now()}@local`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//InterviewAI//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    "DESCRIPTION:Mock interview practice — https://interviewai.app",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "interviewai-practice-block.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
