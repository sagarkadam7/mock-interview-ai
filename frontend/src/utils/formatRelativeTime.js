/**
 * Human-readable relative time for dashboards and lists (en locale).
 * @param {string|number|Date} input
 * @returns {string}
 */
export function formatRelativeTime(input) {
  const date = input instanceof Date ? input : new Date(input);
  const ts = date.getTime();
  if (Number.isNaN(ts)) return "";

  const diffMs = Date.now() - ts;
  if (diffMs < 0) {
    const aheadSec = Math.floor(-diffMs / 1000);
    if (aheadSec < 45) return "In a moment";
    const aheadMin = Math.floor(aheadSec / 60);
    if (aheadMin < 60) return aheadMin <= 1 ? "In 1 min" : `In ${aheadMin} min`;
    const aheadHrs = Math.floor(aheadMin / 60);
    if (aheadHrs < 24) return aheadHrs === 1 ? "In 1 hour" : `In ${aheadHrs} hours`;
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "Just now";

  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? "1 min ago" : `${min} min ago`;

  const hrs = Math.floor(min / 60);
  if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
